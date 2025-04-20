/**
 * 历史记录服务
 * 用于管理目标系统操作的历史记录
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryRecord, TargetSystem, OperationStatus } from '../types';

// 存储键
const HISTORY_STORAGE_KEY = 'history_records';

/**
 * 获取所有历史记录
 * @returns 历史记录数组
 */
export async function getAllHistoryRecords(): Promise<HistoryRecord[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (!jsonValue) return [];
    return JSON.parse(jsonValue) as HistoryRecord[];
  } catch (error) {
    console.error('读取历史记录出错:', error);
    return [];
  }
}

/**
 * 添加新的历史记录
 * @param record 新记录
 */
export async function addHistoryRecord(record: Omit<HistoryRecord, 'id' | 'timestamp'>): Promise<HistoryRecord> {
  try {
    const newRecord: HistoryRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    const records = await getAllHistoryRecords();
    const updatedRecords = [newRecord, ...records];
    
    // 如果记录太多，只保留最近的100条
    const limitedRecords = updatedRecords.slice(0, 100);
    
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedRecords));
    return newRecord;
  } catch (error) {
    console.error('添加历史记录出错:', error);
    throw new Error('无法保存历史记录');
  }
}

/**
 * 更新现有历史记录
 * @param id 记录ID
 * @param updates 更新字段
 */
export async function updateHistoryRecord(id: string, updates: Partial<HistoryRecord>): Promise<void> {
  try {
    const records = await getAllHistoryRecords();
    const updatedRecords = records.map(record => 
      record.id === id ? { ...record, ...updates } : record
    );
    
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error('更新历史记录出错:', error);
    throw new Error('无法更新历史记录');
  }
}

/**
 * 删除历史记录
 * @param id 记录ID
 */
export async function deleteHistoryRecord(id: string): Promise<void> {
  try {
    const records = await getAllHistoryRecords();
    const filteredRecords = records.filter(record => record.id !== id);
    
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filteredRecords));
  } catch (error) {
    console.error('删除历史记录出错:', error);
    throw new Error('无法删除历史记录');
  }
}

/**
 * 清空所有历史记录
 */
export async function clearAllHistoryRecords(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('清空历史记录出错:', error);
    throw new Error('无法清空历史记录');
  }
}

/**
 * 根据目标系统筛选历史记录
 * @param targetSystem 目标系统
 */
export async function filterHistoryByTargetSystem(targetSystem: TargetSystem): Promise<HistoryRecord[]> {
  const records = await getAllHistoryRecords();
  return records.filter(record => record.targetSystem === targetSystem);
}

/**
 * 根据状态筛选历史记录
 * @param status 操作状态
 */
export async function filterHistoryByStatus(status: OperationStatus): Promise<HistoryRecord[]> {
  const records = await getAllHistoryRecords();
  return records.filter(record => record.status === status);
}

/**
 * 获取最近的历史记录
 * @param count 记录数量
 */
export async function getRecentHistoryRecords(count: number = 5): Promise<HistoryRecord[]> {
  const records = await getAllHistoryRecords();
  return records.slice(0, count);
}

/**
 * 模拟操作执行
 * 实际实现中，这里应该调用实际的目标系统API
 * @param recordId 历史记录ID
 */
export async function executeOperation(recordId: string): Promise<void> {
  try {
    const records = await getAllHistoryRecords();
    const record = records.find(r => r.id === recordId);
    
    if (!record) {
      throw new Error('找不到指定的记录');
    }
    
    // 标记为处理中
    await updateHistoryRecord(recordId, { status: 'pending' });
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 90%的概率成功，10%的概率失败
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      await updateHistoryRecord(recordId, { 
        status: 'success',
        metadata: { ...record.metadata, executedAt: Date.now() }
      });
    } else {
      await updateHistoryRecord(recordId, { 
        status: 'failure',
        error: '操作执行失败，请稍后重试。'
      });
    }
  } catch (error) {
    console.error('执行操作出错:', error);
    await updateHistoryRecord(recordId, { 
      status: 'failure',
      error: error instanceof Error ? error.message : '未知错误'
    });
    throw error;
  }
} 