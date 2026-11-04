//! System check: OS, CPU, RAM and GPUs with their VRAM, plus the GPU backend.

use serde::Serialize;
use std::process::Command;

#[derive(Serialize, Clone, Debug)]
pub struct Gpu {
    pub name: String,
    pub vendor: String,
    /// Dedicated video memory in GiB (0 when unknown).
    pub vram_gb: f64,
}

#[derive(Serialize, Debug)]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub cpu_threads: usize,
    pub ram_gb: f64,
    pub gpus: Vec<Gpu>,
    /// "cuda", "vulkan", "metal" or "cpu": the GPU backend Ollama will use.
    pub backend: String,
    /// VRAM used for the recommendation (largest GPU; unified memory on Apple Silicon).
    pub usable_vram_gb: f64,
}

fn run(cmd: &str, args: &[&str]) -> Option<String> {
    let mut c = Command::new(cmd);
    c.args(args);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        c.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
    }
    let out = c.output().ok()?;
    out.status.success().then(|| String::from_utf8_lossy(&out.stdout).to_string())
}

fn nvidia_gpus() -> Vec<Gpu> {
    let Some(out) = run("nvidia-smi", &["--query-gpu=name,memory.total", "--format=csv,noheader,nounits"]) else {
        return vec![];
    };
    out.lines()
        .filter_map(|l| {
            let (name, mib) = l.rsplit_once(',')?;
            Some(Gpu { name: name.trim().to_string(), vendor: "nvidia".into(), vram_gb: mib.trim().parse::<f64>().ok()? / 1024.0 })
        })
        .collect()
}

#[cfg(target_os = "windows")]
fn other_gpus() -> Vec<Gpu> {
    // qwMemorySize is the 64-bit VRAM size; Win32_VideoController.AdapterRAM caps at 4 GiB.
    let script = r#"Get-ItemProperty 'HKLM:\SYSTEM\ControlSet001\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0*' -ErrorAction SilentlyContinue | Where-Object { $_.DriverDesc } | ForEach-Object { "$($_.DriverDesc)|$($_.'HardwareInformation.qwMemorySize')" }"#;
    run("powershell", &["-NoProfile", "-Command", script])
        .unwrap_or_default()
        .lines()
        .filter_map(|l| {
            let (name, bytes) = l.split_once('|')?;
            let lower = name.to_lowercase();
            let vendor = if lower.contains("nvidia") { "nvidia" } else if lower.contains("amd") || lower.contains("radeon") { "amd" } else if lower.contains("intel") { "intel" } else { "other" };
            Some(Gpu { name: name.trim().into(), vendor: vendor.into(), vram_gb: bytes.trim().parse::<f64>().unwrap_or(0.0) / 1_073_741_824.0 })
        })
        .collect()
}

#[cfg(target_os = "linux")]
fn other_gpus() -> Vec<Gpu> {
    // AMD exposes VRAM in sysfs; other cards are listed without a size.
    let mut gpus = vec![];
    if let Ok(entries) = std::fs::read_dir("/sys/class/drm") {
        for e in entries.flatten() {
            let p = e.path().join("device/mem_info_vram_total");
            if let Ok(s) = std::fs::read_to_string(&p) {
                if let Ok(bytes) = s.trim().parse::<f64>() {
                    gpus.push(Gpu { name: "AMD GPU".into(), vendor: "amd".into(), vram_gb: bytes / 1_073_741_824.0 });
                }
            }
        }
    }
    gpus
}

#[cfg(target_os = "macos")]
fn other_gpus() -> Vec<Gpu> {
    vec![]
}

#[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
fn other_gpus() -> Vec<Gpu> {
    vec![]
}

fn ram_gb() -> f64 {
    #[cfg(target_os = "linux")]
    {
        if let Ok(s) = std::fs::read_to_string("/proc/meminfo") {
            if let Some(kb) = s.lines().find(|l| l.starts_with("MemTotal:")).and_then(|l| l.split_whitespace().nth(1)).and_then(|v| v.parse::<f64>().ok()) {
                return kb / 1_048_576.0;
            }
        }
    }
    #[cfg(target_os = "macos")]
    {
        if let Some(b) = run("sysctl", &["-n", "hw.memsize"]).and_then(|s| s.trim().parse::<f64>().ok()) {
            return b / 1_073_741_824.0;
        }
    }
    #[cfg(target_os = "windows")]
    {
        if let Some(b) = run("powershell", &["-NoProfile", "-Command", "(Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory"]).and_then(|s| s.trim().parse::<f64>().ok()) {
            return b / 1_073_741_824.0;
        }
    }
    0.0
}

fn has_vulkan() -> bool {
    run("vulkaninfo", &["--summary"]).is_some()
        || cfg!(target_os = "windows") && std::path::Path::new("C:\\Windows\\System32\\vulkan-1.dll").exists()
}

#[tauri::command]
pub fn system_check() -> SystemInfo {
    let mut gpus = nvidia_gpus();
    let nvidia = !gpus.is_empty();
    gpus.extend(other_gpus().into_iter().filter(|g| !(nvidia && g.vendor == "nvidia")));
    let ram = ram_gb();
    let apple_silicon = cfg!(target_os = "macos") && cfg!(target_arch = "aarch64");
    let backend = if apple_silicon {
        "metal"
    } else if nvidia {
        "cuda"
    } else if gpus.iter().any(|g| g.vram_gb >= 3.0) && has_vulkan() {
        "vulkan"
    } else {
        "cpu"
    };
    let usable = if apple_silicon {
        // Metal can use roughly two thirds of unified memory.
        ram * 0.66
    } else if backend == "cpu" {
        0.0
    } else {
        gpus.iter().map(|g| g.vram_gb).fold(0.0, f64::max)
    };
    SystemInfo {
        os: std::env::consts::OS.into(),
        arch: std::env::consts::ARCH.into(),
        cpu_threads: std::thread::available_parallelism().map(|n| n.get()).unwrap_or(4),
        ram_gb: (ram * 10.0).round() / 10.0,
        gpus,
        backend: backend.into(),
        usable_vram_gb: (usable * 10.0).round() / 10.0,
    }
}
