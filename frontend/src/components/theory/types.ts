export interface CaseStudy {
  title: string;
  situation: string;
  decision: string;
  explanation: string;
}

export interface Chapter {
  id: string;
  title: string;
  overview: string;
  keyIdeas: string[];
  detailedExplanation: string;
  caseStudies: CaseStudy[];
  commonMistakes: string[];
  proTips: string[];
  connections: string[];
}

export interface Part {
  title: string;
  chapters: Chapter[];
}

export interface TheoryData {
  parts: Part[];
}
