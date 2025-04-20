import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// 中文资源
const zhResources = {
  translation: {
    // 通用
    common: {
      ok: '确定',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      loading: '加载中...',
      retry: '重试',
      clear: '清空',
      confirm: '确认',
      success: '成功',
      failure: '失败',
      error: '错误',
      pending: '处理中',
      all: '全部',
    },
    
    // 历史记录
    history: {
      title: '历史记录',
      emptyState: '暂无历史记录',
      clearConfirmTitle: '清空历史记录',
      clearConfirmMessage: '确定要清空所有历史记录吗？此操作不可撤销。',
      clearSuccess: '历史记录已清空',
      loadError: '加载历史记录失败',
      addTestSuccess: '已添加测试数据',
      addTestError: '添加测试数据失败',
      originalText: '原始: ',
      processedText: '处理后: ',
      operationExecuteFailure: '操作执行失败',
    },
    
    // 目标系统
    targetSystem: {
      calendar: '日历',
      reminder: '提醒',
      note: '笔记',
      none: '其他',
    },
    
    // 操作
    operation: {
      create: '创建',
      update: '修改',
      delete: '删除',
      query: '查询',
    },
  },
};

// 英文资源
const enResources = {
  translation: {
    // 通用
    common: {
      ok: 'OK',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      retry: 'Retry',
      clear: 'Clear',
      confirm: 'Confirm',
      success: 'Success',
      failure: 'Failure',
      error: 'Error',
      pending: 'Pending',
      all: 'All',
    },
    
    // 历史记录
    history: {
      title: 'History Records',
      emptyState: 'No history records',
      clearConfirmTitle: 'Clear History',
      clearConfirmMessage: 'Are you sure you want to clear all history records? This action cannot be undone.',
      clearSuccess: 'History records cleared',
      loadError: 'Failed to load history records',
      addTestSuccess: 'Test data added',
      addTestError: 'Failed to add test data',
      originalText: 'Original: ',
      processedText: 'Processed: ',
      operationExecuteFailure: 'Operation execution failed',
    },
    
    // 目标系统
    targetSystem: {
      calendar: 'Calendar',
      reminder: 'Reminder',
      note: 'Note',
      none: 'Other',
    },
    
    // 操作
    operation: {
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
      query: 'Query',
    },
  },
};

// 初始化 i18next
i18next.use(initReactI18next).init({
  resources: {
    zh: zhResources,
    en: enResources,
  },
  lng: 'zh', // 默认语言
  fallbackLng: 'en', // 回退语言
  interpolation: {
    escapeValue: false, // 不转义插值内容
  },
});

export default i18next; 