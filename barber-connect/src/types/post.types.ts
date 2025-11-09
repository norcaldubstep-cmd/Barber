export enum PostType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  CAROUSEL = 'CAROUSEL',
  TUTORIAL = 'TUTORIAL',
  TRANSFORMATION = 'TRANSFORMATION',
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  isVerified: boolean;
  promotionTier?: string;

  type: PostType;
  caption?: string;
  hashtags: string[];
  mentions: string[];

  media: MediaItem[];

  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  viewsCount: number;

  isLiked: boolean;
  isSaved: boolean;

  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };

  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isVerified: boolean;
  content: string;
  likesCount: number;
  isLiked: boolean;
  repliesCount: number;
  parentCommentId?: string;
  createdAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  media: MediaItem;
  caption?: string;
  viewsCount: number;
  hasViewed: boolean;
  createdAt: string;
  expiresAt: string;
}
