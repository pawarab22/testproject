/**
 * JSON File Storage System
 * Loads from public/data/*.json files
 * NO localStorage - data stored in JSON files only
 */

import { Enquiry } from '../types/enquiry';
import { Feedback } from '../types/feedback';
import { PortfolioItem } from '../types/portfolio';
import * as jsonStorage from './jsonStorage';

// Initialize data from JSON files on module load
let isInitialized = false;

export async function initializeData(): Promise<void> {
  if (isInitialized) return;
  await jsonStorage.loadFromJSONFiles();
  isInitialized = true;
}

// ========== ENQUIRIES ==========
export function getEnquiries(): Enquiry[] {
  return jsonStorage.getEnquiries();
}

export async function saveEnquiry(enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status'>): Promise<Enquiry> {
  const newEnquiry = await jsonStorage.saveEnquiry(enquiry);
  // Data automatically saved to JSON file (if file handles initialized)
  return newEnquiry;
}

export async function updateEnquiryStatus(id: string, status: 'PENDING' | 'CONTACTED'): Promise<void> {
  await jsonStorage.updateEnquiryStatus(id, status);
  // Data automatically saved to JSON file (if file handles initialized)
}

export async function addEnquiryReply(id: string, reply: string): Promise<void> {
  await jsonStorage.addEnquiryReply(id, reply);
  // Data automatically saved to JSON file (if file handles initialized)
}

export async function updateEnquiryReply(id: string, reply: string): Promise<void> {
  await jsonStorage.updateEnquiryReply(id, reply);
  // Data automatically saved to JSON file (if file handles initialized)
}

export async function deleteEnquiryReply(id: string): Promise<void> {
  await jsonStorage.deleteEnquiryReply(id);
  // Data automatically saved to JSON file (if file handles initialized)
}

// ========== FEEDBACKS ==========
export function getFeedbacks(): Feedback[] {
  return jsonStorage.getFeedbacks();
}

export async function saveFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
  const newFeedback = await jsonStorage.saveFeedback(feedback);
  // Data automatically saved to JSON file (if file handles initialized)
  return newFeedback;
}

export async function addFeedbackReply(id: string, reply: string): Promise<void> {
  await jsonStorage.addFeedbackReply(id, reply);
  // Data automatically saved to JSON file (if file handles initialized)
}

export async function updateFeedbackReply(id: string, reply: string): Promise<void> {
  await jsonStorage.updateFeedbackReply(id, reply);
  // Data automatically saved to JSON file (if file handles initialized)
}

export async function deleteFeedbackReply(id: string): Promise<void> {
  await jsonStorage.deleteFeedbackReply(id);
  // Data automatically saved to JSON file (if file handles initialized)
}

// ========== PORTFOLIO ==========
// Portfolio still uses localStorage for now (can be migrated later)
const PORTFOLIO_KEY = 'pooja_aura_portfolio';

export function getPortfolioItems(): PortfolioItem[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const data = localStorage.getItem(PORTFOLIO_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading portfolio items:', error);
    return [];
  }
}

export function savePortfolioItem(item: Omit<PortfolioItem, 'id' | 'createdAt'>): PortfolioItem {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('LocalStorage is not available');
    }
    const items = getPortfolioItems();
    const newItem: PortfolioItem = {
      ...item,
      id: `port_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(items));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('portfolioUpdated'));
    }
    
    return newItem;
  } catch (error) {
    console.error('Error saving portfolio item:', error);
    throw new Error('Failed to save portfolio item. Please try again.');
  }
}

export function deletePortfolioItem(id: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const items = getPortfolioItems();
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(filtered));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('portfolioUpdated'));
    }
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
  }
}

export function updatePortfolioItem(id: string, updates: Partial<PortfolioItem>): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const items = getPortfolioItems();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(items));
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('portfolioUpdated'));
      }
    }
  } catch (error) {
    console.error('Error updating portfolio item:', error);
  }
}

// Export JSON download/upload functions
export { 
  downloadEnquiryJSON, 
  downloadFeedbackJSON, 
  downloadRettingsJSON,
  downloadAllJSON,
  loadFromJSONFile,
  importEnquiryJSON,
  importFeedbackJSON,
  importRettingsJSON,
  getRettings
} from './jsonStorage';
