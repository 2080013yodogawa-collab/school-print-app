export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
}

export interface SchoolItem {
  id: string;
  name: string;
  deadline?: string;
  note?: string;
  checked: boolean;
}

export interface AnalysisResult {
  events: SchoolEvent[];
  items: SchoolItem[];
  notices: string[];
  rawText?: string;
}

export interface PrintRecord {
  id: string;
  title: string;
  createdAt: string;
  result: AnalysisResult;
  images?: string[]; // dataUrl of uploaded photos
}
