/**
 * Frontend-only JSON file storage system
 * Uses IndexedDB + File System Access API to write directly to JSON files
 * Works on static hosting (Vercel) - data persists in browser and JSON files
 * NO backend, NO API, NO database, NO localStorage
 */

import { Enquiry } from '../types/enquiry';
import { Feedback } from '../types/feedback';
import { PortfolioItem } from '../types/portfolio';

// In-memory storage (synced with IndexedDB and JSON files)
let enquiriesData: Enquiry[] = [];
let feedbacksData: Feedback[] = [];
let rettingsData: any[] = [];
let portfolioData: PortfolioItem[] = [];

// File handle references (using object references to share state) - exported for admin setup
export const enquiryFileHandleRef: { current: FileSystemFileHandle | null } = { current: null };
export const feedbackFileHandleRef: { current: FileSystemFileHandle | null } = { current: null };
export const rettingsFileHandleRef: { current: FileSystemFileHandle | null } = { current: null };
export const portfolioFileHandleRef: { current: FileSystemFileHandle | null } = { current: null };

// Sync file handles (no-op, kept for compatibility)
function syncFileHandles(): void {
  // File handles are managed via refs directly
}

// IndexedDB database name and version
const DB_NAME = 'PoojaAuraData';
const DB_VERSION = 3; // Incremented to add portfolio store (was upgraded to 3 by ensurePortfolioStore)
const STORES = {
  ENQUIRIES: 'enquiries',
  FEEDBACKS: 'feedbacks',
  RETTINGS: 'rettings',
  PORTFOLIO: 'portfolio',
} as const;

// JSON file paths in public/data/ (for initial data loading)
const JSON_FILES = {
  ENQUIRY: '/data/Enquiry.json',
  FEEDBACK: '/data/Feedback.json',
  RETTINGS: '/data/Rettings.json',
  PORTFOLIO: '/data/Portfolio.json',
} as const;

// ========== INDEXEDDB SETUP ==========
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion || 0;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.ENQUIRIES)) {
        db.createObjectStore(STORES.ENQUIRIES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.FEEDBACKS)) {
        db.createObjectStore(STORES.FEEDBACKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.RETTINGS)) {
        db.createObjectStore(STORES.RETTINGS, { keyPath: 'id' });
      }
      
      // Add portfolio store in version 2+ upgrade
      if (oldVersion < 2 && !db.objectStoreNames.contains(STORES.PORTFOLIO)) {
        db.createObjectStore(STORES.PORTFOLIO, { keyPath: 'id' });
      }
      // Also ensure portfolio store exists for version 3 upgrade
      if (oldVersion >= 2 && oldVersion < 3 && !db.objectStoreNames.contains(STORES.PORTFOLIO)) {
        db.createObjectStore(STORES.PORTFOLIO, { keyPath: 'id' });
      }
    };
  });
}

// Helper function to ensure portfolio store exists
async function ensurePortfolioStore(): Promise<void> {
  try {
    // First check current database version
    const checkRequest = indexedDB.open(DB_NAME);
    let currentVersion = DB_VERSION;
    await new Promise<void>((resolve) => {
      checkRequest.onsuccess = () => {
        currentVersion = checkRequest.result.version;
        checkRequest.result.close();
        resolve();
      };
      checkRequest.onerror = () => resolve();
    });
    
    const db = await openDB();
    if (!db.objectStoreNames.contains(STORES.PORTFOLIO)) {
      // Store doesn't exist, need to upgrade
      db.close();
      
      // Force upgrade by incrementing version
      const upgradeVersion = currentVersion + 1;
      const upgradeRequest = indexedDB.open(DB_NAME, upgradeVersion);
      
      await new Promise<void>((resolve, reject) => {
        upgradeRequest.onerror = () => reject(upgradeRequest.error);
        upgradeRequest.onsuccess = () => {
          upgradeRequest.result.close();
          resolve();
        };
        upgradeRequest.onupgradeneeded = (event) => {
          const upgradeDb = (event.target as IDBOpenDBRequest).result;
          // Ensure all stores exist
          if (!upgradeDb.objectStoreNames.contains(STORES.ENQUIRIES)) {
            upgradeDb.createObjectStore(STORES.ENQUIRIES, { keyPath: 'id' });
          }
          if (!upgradeDb.objectStoreNames.contains(STORES.FEEDBACKS)) {
            upgradeDb.createObjectStore(STORES.FEEDBACKS, { keyPath: 'id' });
          }
          if (!upgradeDb.objectStoreNames.contains(STORES.RETTINGS)) {
            upgradeDb.createObjectStore(STORES.RETTINGS, { keyPath: 'id' });
          }
          if (!upgradeDb.objectStoreNames.contains(STORES.PORTFOLIO)) {
            upgradeDb.createObjectStore(STORES.PORTFOLIO, { keyPath: 'id' });
          }
        };
      });
    }
  } catch (error) {
    // If upgrade fails, continue anyway - store will be created on next page load
    console.warn('Could not ensure portfolio store exists:', error);
  }
}

// ========== INDEXEDDB OPERATIONS ==========
async function saveToIndexedDB(storeName: string, data: any[]): Promise<void> {
  try {
    const db = await openDB();
    
    // Check if store exists before trying to access it
    if (!db.objectStoreNames.contains(storeName)) {
      // Store doesn't exist yet, skip saving (will be created on next upgrade)
      console.warn(`Store ${storeName} does not exist yet. Skipping save.`);
      return;
    }
    
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Clear existing data
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });
    
    // Add all new data
    for (const item of data) {
      await new Promise<void>((resolve, reject) => {
        const addRequest = store.add(item);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => {
          // If item already exists, update it
          if (addRequest.error?.name === 'ConstraintError') {
            const putRequest = store.put(item);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            reject(addRequest.error);
          }
        };
      });
    }
    
    // Wait for transaction to complete
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    
    // console.log(`✅ Data saved to IndexedDB (${storeName}): ${data.length} items`);
  } catch (error) {
    console.error(`Error saving to IndexedDB (${storeName}):`, error);
  }
}

async function loadFromIndexedDB(storeName: string): Promise<any[]> {
  try {
    const db = await openDB();
    
    // Check if store exists before trying to access it
    if (!db.objectStoreNames.contains(storeName)) {
      // Store doesn't exist yet, return empty array
      return [];
    }
    
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`Error loading from IndexedDB (${storeName}):`, error);
    return [];
  }
}

// ========== LOAD FROM JSON FILES AND INDEXEDDB ==========
export async function loadFromJSONFiles(): Promise<void> {
  // Ensure portfolio store exists before loading
  await ensurePortfolioStore();
  
  // First, try to load from IndexedDB (persistent storage with all data)
  try {
    const [indexedEnquiries, indexedFeedbacks, indexedRettings, indexedPortfolio] = await Promise.all([
      loadFromIndexedDB(STORES.ENQUIRIES),
      loadFromIndexedDB(STORES.FEEDBACKS),
      loadFromIndexedDB(STORES.RETTINGS),
      loadFromIndexedDB(STORES.PORTFOLIO),
    ]);
    
    // Always use IndexedDB data (it has all form submissions)
    enquiriesData = indexedEnquiries;
    feedbacksData = indexedFeedbacks;
    rettingsData = indexedRettings;
    portfolioData = indexedPortfolio;
    
    // console.log('✅ Loaded data from IndexedDB:', {
    //   enquiries: enquiriesData.length,
    //   feedbacks: feedbacksData.length,
    //   rettings: rettingsData.length,
    // });
    
    // If IndexedDB is empty, load from JSON files (initial data) and save to IndexedDB
    if (enquiriesData.length === 0 && feedbacksData.length === 0 && rettingsData.length === 0 && portfolioData.length === 0) {
      await loadFromJSONFilesOnly();
    } else {
      // Merge with JSON files to catch any new data from JSON files
      await mergeWithJSONFiles();
    }
  } catch (error) {
    console.warn('IndexedDB not available, loading from JSON files:', error);
  }

  // If IndexedDB is empty, load from JSON files (initial data)
  await loadFromJSONFilesOnly();
}

async function loadFromJSONFilesOnly(): Promise<void> {
  try {
    const enquiryResponse = await fetch(JSON_FILES.ENQUIRY);
    if (enquiryResponse.ok) {
      const data = await enquiryResponse.json();
      enquiriesData = Array.isArray(data) ? data : [];
      if (enquiriesData.length > 0) {
        await saveToIndexedDB(STORES.ENQUIRIES, enquiriesData);
      }
      // console.log('✅ Loaded enquiries from JSON file:', enquiriesData.length);
    }
  } catch (error) {
    console.error('Error loading Enquiry.json:', error);
    enquiriesData = [];
  }

  try {
    const feedbackResponse = await fetch(JSON_FILES.FEEDBACK);
    if (feedbackResponse.ok) {
      const data = await feedbackResponse.json();
      feedbacksData = Array.isArray(data) ? data : [];
      if (feedbacksData.length > 0) {
        await saveToIndexedDB(STORES.FEEDBACKS, feedbacksData);
      }
      // console.log('✅ Loaded feedbacks from JSON file:', feedbacksData.length);
    }
  } catch (error) {
    console.error('Error loading Feedback.json:', error);
    feedbacksData = [];
  }

  try {
    const rettingsResponse = await fetch(JSON_FILES.RETTINGS);
    if (rettingsResponse.ok) {
      const data = await rettingsResponse.json();
      rettingsData = Array.isArray(data) ? data : [];
      if (rettingsData.length > 0) {
        await saveToIndexedDB(STORES.RETTINGS, rettingsData);
      }
      // console.log('✅ Loaded rettings from JSON file:', rettingsData.length);
    }
  } catch (error) {
    console.error('Error loading Rettings.json:', error);
    rettingsData = [];
  }

  try {
    const portfolioResponse = await fetch(JSON_FILES.PORTFOLIO);
    if (portfolioResponse.ok) {
      const data = await portfolioResponse.json();
      portfolioData = Array.isArray(data) ? data : [];
      if (portfolioData.length > 0) {
        await saveToIndexedDB(STORES.PORTFOLIO, portfolioData);
      }
      // console.log('✅ Loaded portfolio from JSON file:', portfolioData.length);
    }
  } catch (error) {
    console.error('Error loading Portfolio.json:', error);
    portfolioData = [];
  }
}

async function mergeWithJSONFiles(): Promise<void> {
  // Merge JSON file data with IndexedDB data (avoid duplicates)
  try {
    const enquiryResponse = await fetch(JSON_FILES.ENQUIRY);
    if (enquiryResponse.ok) {
      const jsonData = await enquiryResponse.json();
      const jsonArray = Array.isArray(jsonData) ? jsonData : [];
      // Merge: add items from JSON that don't exist in IndexedDB
      const existingIds = new Set(enquiriesData.map(e => e.id));
      const newItems = jsonArray.filter((item: any) => !existingIds.has(item.id));
      if (newItems.length > 0) {
        enquiriesData.push(...newItems);
        await saveToIndexedDB(STORES.ENQUIRIES, enquiriesData);
      }
    }
  } catch (error) {
    // Ignore errors
  }

  try {
    const feedbackResponse = await fetch(JSON_FILES.FEEDBACK);
    if (feedbackResponse.ok) {
      const jsonData = await feedbackResponse.json();
      const jsonArray = Array.isArray(jsonData) ? jsonData : [];
      const existingIds = new Set(feedbacksData.map(f => f.id));
      const newItems = jsonArray.filter((item: any) => !existingIds.has(item.id));
      if (newItems.length > 0) {
        feedbacksData.push(...newItems);
        await saveToIndexedDB(STORES.FEEDBACKS, feedbacksData);
      }
    }
  } catch (error) {
    // Ignore errors
  }

  try {
    const rettingsResponse = await fetch(JSON_FILES.RETTINGS);
    if (rettingsResponse.ok) {
      const jsonData = await rettingsResponse.json();
      const jsonArray = Array.isArray(jsonData) ? jsonData : [];
      const existingIds = new Set(rettingsData.map(r => r.id));
      const newItems = jsonArray.filter((item: any) => !existingIds.has(item.id));
      if (newItems.length > 0) {
        rettingsData.push(...newItems);
        await saveToIndexedDB(STORES.RETTINGS, rettingsData);
      }
    }
  } catch (error) {
    // Ignore errors
  }

  try {
    const portfolioResponse = await fetch(JSON_FILES.PORTFOLIO);
    if (portfolioResponse.ok) {
      const jsonData = await portfolioResponse.json();
      const jsonArray = Array.isArray(jsonData) ? jsonData : [];
      const existingIds = new Set(portfolioData.map(p => p.id));
      const newItems = jsonArray.filter((item: PortfolioItem) => !existingIds.has(item.id));
      if (newItems.length > 0) {
        portfolioData.push(...newItems);
        await saveToIndexedDB(STORES.PORTFOLIO, portfolioData);
      }
    }
  } catch (error) {
    // Ignore errors
  }
}

// ========== DIRECT FILE WRITING (File System Access API) ==========
// Initialize file handle for a specific JSON file (one-time setup)
export async function initializeFileHandle(filename: string, fileHandleRef: { current: FileSystemFileHandle | null }): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined' || !('showOpenFilePicker' in window)) {
    return {
      success: false,
      message: 'File System Access API is not supported in this browser. Please use a modern browser like Chrome or Edge.',
    };
  }

  try {
    // Use showOpenFilePicker for existing files (better permission persistence)
    const handles = await (window as any).showOpenFilePicker({
      types: [{
        description: 'JSON files',
        accept: { 'application/json': ['.json'] },
      }],
      multiple: false,
    });
    
    const handle = handles[0];
    
    // Verify the file name matches
    if (handle.name !== filename) {
      // Still allow it, but warn
      console.warn(`Selected file "${handle.name}" doesn't match expected "${filename}". Proceeding anyway.`);
    }
    
    fileHandleRef.current = handle;
    syncFileHandles();
    
    return {
      success: true,
      message: `✅ File access granted for ${filename}. Data will now be saved directly to this file at: ${handle.name}`,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'File selection was cancelled.',
      };
    }
    return {
      success: false,
      message: `Error: ${error.message || 'Failed to initialize file access'}`,
    };
  }
}

// Check if file handle is initialized
export function isFileHandleInitialized(fileHandleRef: { current: FileSystemFileHandle | null }): boolean {
  return fileHandleRef.current !== null;
}

// Write data directly to JSON files using File System Access API
async function writeToJSONFile(filename: string, data: any[], fileHandleRef: { current: FileSystemFileHandle | null }): Promise<void> {
  // Try to get file handle if not available
  if (!fileHandleRef.current) {
    // Don't auto-prompt - require explicit setup via Admin Dashboard
    console.warn(`⚠️ File handle not initialized for ${filename}. Please use "Enable File Writing" in Admin Dashboard.`);
    // Fallback: auto-download
    autoDownloadJSONFile(filename, data);
    return;
  }

  // Write directly to file
  try {
    const writable = await fileHandleRef.current.createWritable();
    const json = JSON.stringify(data, null, 2);
    await writable.write(json);
    await writable.close();
    // console.log(`✅ Data written directly to ${filename} (${data.length} items)`);
  } catch (error) {
    console.error(`❌ Error writing to ${filename}:`, error);
    // Clear handle if invalid and fallback to download
    fileHandleRef.current = null;
    syncFileHandles();
    autoDownloadJSONFile(filename, data);
  }
}

// Fallback: Auto-download if file writing fails
function autoDownloadJSONFile(filename: string, data: any[]): void {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // console.log(`📥 ${filename} downloaded (${data.length} items) - replace file in public/data/ folder`);
  } catch (error) {
    console.error(`Error downloading ${filename}:`, error);
  }
}


// ========== ENQUIRIES ==========
export function getEnquiries(): Enquiry[] {
  return [...enquiriesData];
}

export async function saveEnquiry(enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status'>): Promise<Enquiry> {
  const newEnquiry: Enquiry = {
    ...enquiry,
    id: `enq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  };
  enquiriesData.push(newEnquiry);
  // console.log('✅ Enquiry saved. Total enquiries:', enquiriesData.length);
  
  // Save to IndexedDB automatically
  await saveToIndexedDB(STORES.ENQUIRIES, enquiriesData);
  
  // Write directly to JSON file
  syncFileHandles();
  await writeToJSONFile('Enquiry.json', enquiriesData, enquiryFileHandleRef);
  
  return newEnquiry;
}

export async function updateEnquiryStatus(id: string, status: 'PENDING' | 'CONTACTED'): Promise<void> {
  const index = enquiriesData.findIndex(e => e.id === id);
  if (index !== -1) {
    enquiriesData[index].status = status;
    await saveToIndexedDB(STORES.ENQUIRIES, enquiriesData);
    syncFileHandles();
    await writeToJSONFile('Enquiry.json', enquiriesData, enquiryFileHandleRef);
  }
}

export async function addEnquiryReply(id: string, reply: string): Promise<void> {
  const index = enquiriesData.findIndex(e => e.id === id);
  if (index !== -1) {
    enquiriesData[index].adminReply = reply;
    enquiriesData[index].adminReplyDate = new Date().toISOString();
    await saveToIndexedDB(STORES.ENQUIRIES, enquiriesData);
    syncFileHandles();
    await writeToJSONFile('Enquiry.json', enquiriesData, enquiryFileHandleRef);
  }
}

export async function updateEnquiryReply(id: string, reply: string): Promise<void> {
  const index = enquiriesData.findIndex(e => e.id === id);
  if (index !== -1) {
    enquiriesData[index].adminReply = reply;
    enquiriesData[index].adminReplyDate = new Date().toISOString();
    await saveToIndexedDB(STORES.ENQUIRIES, enquiriesData);
    syncFileHandles();
    await writeToJSONFile('Enquiry.json', enquiriesData, enquiryFileHandleRef);
  }
}

export async function deleteEnquiryReply(id: string): Promise<void> {
  const index = enquiriesData.findIndex(e => e.id === id);
  if (index !== -1) {
    enquiriesData[index].adminReply = undefined;
    enquiriesData[index].adminReplyDate = undefined;
    await saveToIndexedDB(STORES.ENQUIRIES, enquiriesData);
    syncFileHandles();
    await writeToJSONFile('Enquiry.json', enquiriesData, enquiryFileHandleRef);
  }
}

// ========== FEEDBACKS ==========
export function getFeedbacks(): Feedback[] {
  return [...feedbacksData];
}

export async function saveFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
  const newFeedback: Feedback = {
    ...feedback,
    id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  feedbacksData.push(newFeedback);
  // console.log('✅ Feedback saved. Total feedbacks:', feedbacksData.length);
  
  // Save to IndexedDB automatically
  await saveToIndexedDB(STORES.FEEDBACKS, feedbacksData);
  
  // Write directly to JSON file
  syncFileHandles();
  await writeToJSONFile('Feedback.json', feedbacksData, feedbackFileHandleRef);
  
  // Also save to Rettings.json (feedback is also a rating/retting)
  const newRetting = {
    ...newFeedback,
    id: `ret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'feedback',
  };
  rettingsData.push(newRetting);
    await saveToIndexedDB(STORES.RETTINGS, rettingsData);
    syncFileHandles();
    await writeToJSONFile('Rettings.json', rettingsData, rettingsFileHandleRef);
  // console.log('✅ Feedback also saved to Rettings.json. Total rettings:', rettingsData.length);
  
  return newFeedback;
}

export async function addFeedbackReply(id: string, reply: string): Promise<void> {
  const index = feedbacksData.findIndex(f => f.id === id);
  if (index !== -1) {
    feedbacksData[index].adminReply = reply;
    feedbacksData[index].adminReplyDate = new Date().toISOString();
    await saveToIndexedDB(STORES.FEEDBACKS, feedbacksData);
    syncFileHandles();
    await writeToJSONFile('Feedback.json', feedbacksData, feedbackFileHandleRef);
  }
}

export async function updateFeedbackReply(id: string, reply: string): Promise<void> {
  const index = feedbacksData.findIndex(f => f.id === id);
  if (index !== -1) {
    feedbacksData[index].adminReply = reply;
    feedbacksData[index].adminReplyDate = new Date().toISOString();
    await saveToIndexedDB(STORES.FEEDBACKS, feedbacksData);
    syncFileHandles();
    await writeToJSONFile('Feedback.json', feedbacksData, feedbackFileHandleRef);
  }
}

export async function deleteFeedbackReply(id: string): Promise<void> {
  const index = feedbacksData.findIndex(f => f.id === id);
  if (index !== -1) {
    feedbacksData[index].adminReply = undefined;
    feedbacksData[index].adminReplyDate = undefined;
    await saveToIndexedDB(STORES.FEEDBACKS, feedbacksData);
    syncFileHandles();
    await writeToJSONFile('Feedback.json', feedbacksData, feedbackFileHandleRef);
  }
}

// ========== RETTINGS ==========
export function getRettings(): any[] {
  return [...rettingsData];
}

export async function saveRetting(retting: any): Promise<any> {
  const newRetting = {
    ...retting,
    id: `ret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  rettingsData.push(newRetting);
  // console.log('✅ Retting saved. Total rettings:', rettingsData.length);
  
  // Save to IndexedDB automatically
  await saveToIndexedDB(STORES.RETTINGS, rettingsData);
  
  // Write directly to JSON file
  syncFileHandles();
  await writeToJSONFile('Rettings.json', rettingsData, rettingsFileHandleRef);
  
  return newRetting;
}

// ========== AUTO-SYNC JSON FILES (Automatic update on admin dashboard load) ==========
// This function is called automatically to keep JSON files in sync with IndexedDB data
export function autoSyncJSONFiles(): void {
  // Auto-download updated JSON files silently (admin can replace files in public/data/)
  // This happens automatically when admin views dashboard
  try {
    // Enquiry.json
    const enquiryJson = JSON.stringify(enquiriesData, null, 2);
    const enquiryBlob = new Blob([enquiryJson], { type: 'application/json' });
    const enquiryUrl = URL.createObjectURL(enquiryBlob);
    const enquiryLink = document.createElement('a');
    enquiryLink.href = enquiryUrl;
    enquiryLink.download = 'Enquiry.json';
    enquiryLink.style.display = 'none';
    document.body.appendChild(enquiryLink);
    enquiryLink.click();
    document.body.removeChild(enquiryLink);
    URL.revokeObjectURL(enquiryUrl);
    
    // Feedback.json
    const feedbackJson = JSON.stringify(feedbacksData, null, 2);
    const feedbackBlob = new Blob([feedbackJson], { type: 'application/json' });
    const feedbackUrl = URL.createObjectURL(feedbackBlob);
    const feedbackLink = document.createElement('a');
    feedbackLink.href = feedbackUrl;
    feedbackLink.download = 'Feedback.json';
    feedbackLink.style.display = 'none';
    document.body.appendChild(feedbackLink);
    feedbackLink.click();
    document.body.removeChild(feedbackLink);
    URL.revokeObjectURL(feedbackUrl);
    
    // Rettings.json
    const rettingsJson = JSON.stringify(rettingsData, null, 2);
    const rettingsBlob = new Blob([rettingsJson], { type: 'application/json' });
    const rettingsUrl = URL.createObjectURL(rettingsBlob);
    const rettingsLink = document.createElement('a');
    rettingsLink.href = rettingsUrl;
    rettingsLink.download = 'Rettings.json';
    rettingsLink.style.display = 'none';
    document.body.appendChild(rettingsLink);
    rettingsLink.click();
    document.body.removeChild(rettingsLink);
    URL.revokeObjectURL(rettingsUrl);
    
    // console.log('✅ JSON files auto-synced - replace files in public/data/ folder');
  } catch (error) {
    console.error('Error auto-syncing JSON files:', error);
  }
}

// ========== EXPORT TO JSON FILES (Download - Admin Only) ==========
export function downloadEnquiryJSON(): void {
  const json = JSON.stringify(enquiriesData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Enquiry.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadFeedbackJSON(): void {
  const json = JSON.stringify(feedbacksData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Feedback.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadRettingsJSON(): void {
  const json = JSON.stringify(rettingsData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Rettings.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAllJSON(): void {
  const data = {
    Enquiry: enquiriesData,
    Feedback: feedbacksData,
    Rettings: rettingsData,
    exportedAt: new Date().toISOString(),
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ========== IMPORT FROM JSON FILES (Upload) ==========
export async function importEnquiryJSON(jsonString: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = JSON.parse(jsonString);
    enquiriesData = Array.isArray(data) ? data : [];
    await saveToIndexedDB(STORES.ENQUIRIES, enquiriesData);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON format',
    };
  }
}

export async function importFeedbackJSON(jsonString: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = JSON.parse(jsonString);
    feedbacksData = Array.isArray(data) ? data : [];
    await saveToIndexedDB(STORES.FEEDBACKS, feedbacksData);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON format',
    };
  }
}

export async function importRettingsJSON(jsonString: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = JSON.parse(jsonString);
    rettingsData = Array.isArray(data) ? data : [];
    await saveToIndexedDB(STORES.RETTINGS, rettingsData);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON format',
    };
  }
}

export function loadFromJSONFile(file: File, type: 'enquiry' | 'feedback' | 'rettings'): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      let result;
      if (type === 'enquiry') {
        result = await importEnquiryJSON(content);
      } else if (type === 'feedback') {
        result = await importFeedbackJSON(content);
      } else {
        result = await importRettingsJSON(content);
      }
      resolve(result);
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' });
    };
    reader.readAsText(file);
  });
}
