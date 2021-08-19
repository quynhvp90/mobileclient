export interface IJobUserStats {
  applicationStats: any; // TODO
  employerStats: any; // TODO
  hiringManage: string;
  jobId: string;
  jobCountHomework?: number,
  jobCountInterview?: number,
  countQualifield?: number,
  location: string;
  tags: string[];
  title: string;
  unreadChat: boolean;
}