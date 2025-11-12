import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { JobListing, JobApplication, JobType, JobStatus } from '../types/job.types';

/**
 * Jobs Service
 * Handles job listings and applications
 */

// Create a job listing
export const createJobListing = async (
  employerId: string,
  employerName: string,
  businessName: string,
  title: string,
  description: string,
  type: JobType,
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  },
  data: {
    employerAvatar?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryType?: 'hourly' | 'weekly' | 'monthly' | 'yearly';
    boothRentalCost?: number;
    yearsExperienceRequired?: number;
    specialtiesRequired?: string[];
    certificationsRequired?: string[];
    benefits?: string[];
    contactEmail?: string;
    contactPhone?: string;
    applicationUrl?: string;
    expiresAt?: string;
  }
): Promise<JobListing> => {
  try {
    const jobRef = doc(collection(db, 'jobs'));

    const jobData: JobListing = {
      id: jobRef.id,
      employerId,
      employerName,
      businessName,
      title,
      description,
      type,
      status: JobStatus.OPEN,
      location,
      specialtiesRequired: data.specialtiesRequired || [],
      benefits: data.benefits || [],
      applicationCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    await setDoc(jobRef, {
      ...jobData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return jobData;
  } catch (error) {
    // console.error('Create job listing error:', error);
    throw new Error('Failed to create job listing');
  }
};

// Get job listing by ID
export const getJobListing = async (jobId: string): Promise<JobListing | null> => {
  try {
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));

    if (!jobDoc.exists()) {
      return null;
    }

    return { id: jobDoc.id, ...jobDoc.data() } as JobListing;
  } catch (error) {
    // console.error('Get job listing error:', error);
    return null;
  }
};

// Get all job listings
export const getJobListings = async (
  filters?: {
    type?: JobType;
    status?: JobStatus;
    city?: string;
    state?: string;
  },
  limitCount: number = 50
): Promise<JobListing[]> => {
  try {
    let jobsQuery = query(
      collection(db, 'jobs'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Apply filters
    if (filters?.status) {
      jobsQuery = query(
        collection(db, 'jobs'),
        where('status', '==', filters.status),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    if (filters?.type) {
      jobsQuery = query(jobsQuery, where('type', '==', filters.type));
    }

    const snapshot = await getDocs(jobsQuery);
    let jobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JobListing));

    // Client-side filtering for location
    if (filters?.city) {
      jobs = jobs.filter((job) => job.location.city.toLowerCase() === filters.city!.toLowerCase());
    }

    if (filters?.state) {
      jobs = jobs.filter((job) => job.location.state.toLowerCase() === filters.state!.toLowerCase());
    }

    return jobs;
  } catch (error) {
    // console.error('Get job listings error:', error);
    return [];
  }
};

// Get jobs posted by employer
export const getEmployerJobs = async (employerId: string): Promise<JobListing[]> => {
  try {
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('employerId', '==', employerId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(jobsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JobListing));
  } catch (error) {
    // console.error('Get employer jobs error:', error);
    return [];
  }
};

// Update job listing
export const updateJobListing = async (
  jobId: string,
  updates: Partial<JobListing>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // console.error('Update job listing error:', error);
    throw new Error('Failed to update job listing');
  }
};

// Update job status
export const updateJobStatus = async (jobId: string, status: JobStatus): Promise<void> => {
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // console.error('Update job status error:', error);
    throw new Error('Failed to update job status');
  }
};

// Delete job listing
export const deleteJobListing = async (jobId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'jobs', jobId));
  } catch (error) {
    // console.error('Delete job listing error:', error);
    throw new Error('Failed to delete job listing');
  }
};

// Submit job application
export const submitJobApplication = async (
  jobId: string,
  jobTitle: string,
  applicantId: string,
  applicantName: string,
  email: string,
  employerId: string,
  data: {
    applicantAvatar?: string;
    coverLetter?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    phoneNumber?: string;
  }
): Promise<JobApplication> => {
  try {
    const applicationRef = doc(collection(db, 'jobApplications'));

    const applicationData: JobApplication = {
      id: applicationRef.id,
      jobId,
      jobTitle,
      applicantId,
      applicantName,
      employerId,
      email,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    await setDoc(applicationRef, {
      ...applicationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Increment application count on job listing
    await updateDoc(doc(db, 'jobs', jobId), {
      applicationCount: increment(1),
    });

    return applicationData;
  } catch (error) {
    // console.error('Submit job application error:', error);
    throw new Error('Failed to submit application');
  }
};

// Get applications for a job
export const getJobApplications = async (jobId: string): Promise<JobApplication[]> => {
  try {
    const applicationsQuery = query(
      collection(db, 'jobApplications'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(applicationsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JobApplication));
  } catch (error) {
    // console.error('Get job applications error:', error);
    return [];
  }
};

// Get user's applications
export const getUserApplications = async (applicantId: string): Promise<JobApplication[]> => {
  try {
    const applicationsQuery = query(
      collection(db, 'jobApplications'),
      where('applicantId', '==', applicantId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(applicationsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JobApplication));
  } catch (error) {
    // console.error('Get user applications error:', error);
    return [];
  }
};

// Update application status
export const updateApplicationStatus = async (
  applicationId: string,
  status: JobApplication['status'],
  notes?: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'jobApplications', applicationId), {
      status,
      notes,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // console.error('Update application status error:', error);
    throw new Error('Failed to update application status');
  }
};

// Delete application
export const deleteJobApplication = async (applicationId: string, jobId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'jobApplications', applicationId));

    // Decrement application count
    await updateDoc(doc(db, 'jobs', jobId), {
      applicationCount: increment(-1),
    });
  } catch (error) {
    // console.error('Delete application error:', error);
    throw new Error('Failed to delete application');
  }
};

// Search jobs
export const searchJobs = async (
  searchQuery: string,
  filters?: {
    type?: JobType;
    city?: string;
    state?: string;
  }
): Promise<JobListing[]> => {
  try {
    // Get all open jobs (Firestore doesn't support full-text search natively)
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('status', '==', JobStatus.OPEN),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(jobsQuery);
    let jobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JobListing));

    // Client-side filtering
    const lowerQuery = searchQuery.toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(lowerQuery) ||
        job.description.toLowerCase().includes(lowerQuery) ||
        job.businessName.toLowerCase().includes(lowerQuery)
    );

    if (filters?.type) {
      jobs = jobs.filter((job) => job.type === filters.type);
    }

    if (filters?.city) {
      jobs = jobs.filter((job) => job.location.city.toLowerCase() === filters.city!.toLowerCase());
    }

    if (filters?.state) {
      jobs = jobs.filter((job) => job.location.state.toLowerCase() === filters.state!.toLowerCase());
    }

    return jobs;
  } catch (error) {
    // console.error('Search jobs error:', error);
    return [];
  }
};
