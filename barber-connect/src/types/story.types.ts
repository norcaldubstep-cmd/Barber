export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number; // seconds, for videos
  caption?: string;
  createdAt: string;
  expiresAt: string; // Stories expire after 24 hours
  viewCount: number;
  views: string[]; // Array of user IDs who viewed
}

export interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar?: string;
  stories: Story[];
  hasUnviewed: boolean;
  latestStoryTime: string;
}
