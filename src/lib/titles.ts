/** Campaign titles were often saved as "Name: Chapter I"; the chapter is shown separately. */
export function campaignTitle(title: string | undefined): string {
  return (title ?? '').replace(/\s*[:\-\u2013\u2014|]\s*Chapter\s+(?:[IVXLC]+|\d+|One)\s*$/i, '').trim() || (title ?? '');
}
