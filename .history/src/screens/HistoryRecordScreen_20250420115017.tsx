import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Text';
import { HistoryRecord, RootStackParamList, TargetSystem, OperationStatus } from '../types';
import * as HistoryService from '../services/HistoryService';

type HistoryRecordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HistoryRecord'>;

type FilterOption = {
  label: string;
  value: TargetSystem | 'all';
};

const filterOptions: FilterOption[] = [
  { label: '全部', value: 'all' },
  { label: '日历', value: 'calendar' },
  { label: '提醒', value: 'reminder' },
  { label: '笔记', value: 'note' },
];

type StatusFilterOption = {
  label: string;
  value: OperationStatus | 'all';
};

const statusFilterOptions: StatusFilterOption[] = [
  { label: '全部', value: 'all' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'failure' },
  { label: '处理中', value: 'pending' },
];

const StatusTag: React.FC<{ status: OperationStatus }> = ({ status }) => {
  const { colors } = useTheme();

  const getColor = () => {
    switch (status) {
      case 'success':
        return { text: '#2E7D32', bg: '#E8F5E9' };
      case 'failure':
        return { text: '#C62828', bg: '#FFEBEE' };
      case 'pending':
        return { text: '#F57F17', bg: '#FFF8E1' };
      default:
        return { text: colors.text, bg: colors.inputBackground };
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'success':
        return '成功';
      case 'failure':
        return '失败';
      case 'pending':
        return '处理中';
      default:
        return '未知状态';
    }
  };

  const { text, bg } = getColor();

  return (
    <View style={[styles.statusTag, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color: text }]}>{getLabel()}</Text>
    </View>
  );
};

const TargetSystemIcon: React.FC<{ system: TargetSystem }> = ({ system }) => {
  const { colors } = useTheme();

  const getIconName = () => {
    switch (system) {
      case 'calendar':
        return 'calendar-outline';
      case 'reminder':
        return 'checkmark-circle-outline';
      case 'note':
        return 'document-text-outline';
      default:
        return 'ellipsis-horizontal-outline';
    }
  };

  return <Ionicons name={getIconName()} size={20} color={colors.primary} />;
};

const EmptyState: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={60} color={colors.secondaryText} />
      <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
        暂无历史记录
      </Text>
    </View>
  );
};

const RecordItem: React.FC<{
  record: HistoryRecord;
  onRetry: (id: string) => void;
}> = ({ record, onRetry }) => {
  const { colors } = useTheme();
  const date = new Date(record.timestamp);
  const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

  return (
    <View style={[styles.recordItem, { backgroundColor: colors.card }]}>
      <View style={styles.recordHeader}>
        <View style={styles.headerLeft}>
          <TargetSystemIcon system={record.targetSystem} />
          <Text style={styles.operation}>{record.operation}</Text>
        </View>
        <StatusTag status={record.status} />
      </View>
      
      <Text style={styles.originalText} numberOfLines={2}>
        {record.originalText}
      </Text>
      
      {record.processedText && (
        <Text style={[styles.processedText, { color: colors.secondaryText }]} numberOfLines={2}>
          处理后: {record.processedText}
        </Text>
      )}

      <View style={styles.recordFooter}>
        <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
          {formattedDate}
        </Text>
        
        {record.status === 'failure' && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => onRetry(record.id)}
          >
            <Text style={[styles.retryText, { color: '#FFF' }]}>重试</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const HistoryRecordScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<HistoryRecordScreenNavigationProp>();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [systemFilter, setSystemFilter] = useState<FilterOption['value']>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption['value']>('all');

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      let filteredRecords = await HistoryService.getAllHistoryRecords();
      
      // 应用系统筛选
      if (systemFilter !== 'all') {
        filteredRecords = filteredRecords.filter(
          record => record.targetSystem === systemFilter
        );
      }
      
      // 应用状态筛选
      if (statusFilter !== 'all') {
        filteredRecords = filteredRecords.filter(
          record => record.status === statusFilter
        );
      }
      
      setRecords(filteredRecords);
    } catch (error) {
      Alert.alert('错误', '加载历史记录失败');
      console.error('加载历史记录失败', error);
    } finally {
      setLoading(false);
    }
  }, [systemFilter, statusFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  }, [loadRecords]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleRetry = async (id: string) => {
    try {
      await HistoryService.executeOperation(id);
      // 重新加载数据
      loadRecords();
    } catch (error) {
      Alert.alert('错误', '操作执行失败');
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      '清空历史记录',
      '确定要清空所有历史记录吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            try {
              await HistoryService.clearAllHistoryRecords();
              setRecords([]);
            } catch (error) {
              Alert.alert('错误', '清空历史记录失败');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>历史记录</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Ionicons name="trash-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterOption,
                {
                  backgroundColor:
                    systemFilter === option.value ? colors.primary : colors.inputBackground,
                },
              ]}
              onPress={() => setSystemFilter(option.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: systemFilter === option.value ? '#FFF' : colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusFilterOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterOption,
                {
                  backgroundColor:
                    statusFilter === option.value ? colors.primary : colors.inputBackground,
                },
              ]}
              onPress={() => setStatusFilter(option.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: statusFilter === option.value ? '#FFF' : colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <RecordItem record={item} onRetry={handleRetry} />
          )}
          contentContainerStyle={records.length === 0 ? styles.emptyList : styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  filters: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
  },
  recordItem: {
    padding: 16,
    borderRadius: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operation: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
  },
  originalText: {
    fontSize: 15,
    marginBottom: 8,
  },
  processedText: {
    fontSize: 14,
    marginBottom: 8,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 13,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
}); 