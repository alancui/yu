import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  SectionList
} from 'react-native';
import { HeaderBar } from '../components/HeaderBar';
import { Text } from '../components/Text';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { HistoryRecord as HistoryRecordType } from '../types';

// 模拟的历史记录数据
const mockHistoryRecords: HistoryRecordType[] = [
  {
    id: '1',
    originalText: '提醒我下午3点开会',
    processedText: '下午3点开会',
    targetSystem: 'reminder',
    operation: '添加提醒',
    status: 'success',
    timestamp: new Date('2024-05-15T15:30:00').getTime(),
  },
  {
    id: '2',
    originalText: '明天下午2点与客户进行电话会议',
    processedText: '与客户电话会议',
    targetSystem: 'calendar',
    operation: '创建日历事件',
    status: 'success',
    timestamp: new Date('2024-05-15T14:22:00').getTime(),
  },
  {
    id: '3',
    originalText: '记录项目计划大纲：1. 需求分析 2. 设计开发 3. 测试部署',
    processedText: '项目计划大纲...',
    targetSystem: 'note',
    operation: '记录笔记',
    status: 'success',
    timestamp: new Date('2024-05-14T10:15:00').getTime(),
  },
  {
    id: '4',
    originalText: '添加购物清单：牛奶，鸡蛋，面包',
    processedText: '购物清单',
    targetSystem: 'reminder',
    operation: '添加提醒',
    status: 'success',
    timestamp: new Date('2024-05-14T09:45:00').getTime(),
  },
  {
    id: '5',
    originalText: '预约医生',
    processedText: '预约医生',
    targetSystem: 'calendar',
    operation: '创建日历事件',
    status: 'failure',
    timestamp: new Date('2024-05-13T16:30:00').getTime(),
    error: '无法创建事件：缺少必要信息（时间）',
  },
];

type Section = {
  title: string;
  data: HistoryRecordType[];
};

export const HistoryRecord: React.FC = () => {
  const { colors } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [filterSystem, setFilterSystem] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 对历史记录按日期分组
  const groupRecordsByDate = (records: HistoryRecordType[]): Section[] => {
    const groups: Record<string, HistoryRecordType[]> = {};
    
    // 先筛选记录
    let filteredRecords = records;
    
    // 根据搜索文本筛选
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filteredRecords = filteredRecords.filter(record => 
        record.originalText.toLowerCase().includes(lowerSearchText) || 
        record.processedText?.toLowerCase().includes(lowerSearchText)
      );
    }
    
    // 根据系统类型筛选
    if (filterSystem !== 'all') {
      filteredRecords = filteredRecords.filter(record => 
        record.targetSystem === filterSystem
      );
    }
    
    // 根据日期筛选（简化实现）
    if (filterDate !== 'all') {
      const now = new Date().getTime();
      const dayInMs = 24 * 60 * 60 * 1000;
      
      if (filterDate === 'today') {
        filteredRecords = filteredRecords.filter(record => 
          now - record.timestamp < dayInMs
        );
      } else if (filterDate === 'week') {
        filteredRecords = filteredRecords.filter(record => 
          now - record.timestamp < 7 * dayInMs
        );
      } else if (filterDate === 'month') {
        filteredRecords = filteredRecords.filter(record => 
          now - record.timestamp < 30 * dayInMs
        );
      }
    }

    // 按日期分组
    filteredRecords.forEach(record => {
      const date = new Date(record.timestamp);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(record);
    });
    
    // 转换为 SectionList 所需的格式
    return Object.entries(groups)
      .map(([date, data]) => ({
        title: formatDate(date),
        data,
      }))
      .sort((a, b) => new Date(b.title).getTime() - new Date(a.title).getTime());
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getSystemIcon = (system: string): string => {
    switch (system) {
      case 'reminder': return 'checkmark-circle';
      case 'calendar': return 'calendar';
      case 'note': return 'document-text';
      default: return 'apps';
    }
  };

  const getSystemColor = (system: string): string => {
    switch (system) {
      case 'reminder': return '#FF9500';
      case 'calendar': return '#007AFF';
      case 'note': return '#32D74B';
      default: return '#8E8E93';
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSystemName = (system: string): string => {
    switch (system) {
      case 'reminder': return 'Reminders';
      case 'calendar': return 'Calendar';
      case 'note': return 'Notes';
      default: return system;
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      '清除历史记录',
      '确定要清除所有历史记录吗？此操作无法撤销。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '清除', 
          style: 'destructive',
          onPress: () => {
            // 这里应该实现清除逻辑
            Alert.alert('已清除', '所有历史记录已被清除');
          } 
        }
      ]
    );
  };

  // 筛选系统用的按钮
  const SystemFilterButton = ({ system, label }: { system: string, label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterSystem === system && { backgroundColor: colors.primary }
      ]}
      onPress={() => setFilterSystem(system)}
    >
      <Text style={[
        styles.filterButtonText,
        filterSystem === system && { color: 'white' }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // 筛选日期用的按钮
  const DateFilterButton = ({ value, label }: { value: string, label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterDate === value && { backgroundColor: colors.primary }
      ]}
      onPress={() => setFilterDate(value)}
    >
      <Text style={[
        styles.filterButtonText,
        filterDate === value && { color: 'white' }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const sections = groupRecordsByDate(mockHistoryRecords);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderBar 
        title="历史目标系统操作" 
        rightComponent={
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name={showFilters ? "options" : "options-outline"} size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="搜索历史记录..."
          placeholderTextColor={colors.secondaryText}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.secondaryText }]}>系统：</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <SystemFilterButton system="all" label="所有系统" />
              <SystemFilterButton system="reminder" label="Reminders" />
              <SystemFilterButton system="calendar" label="Calendar" />
              <SystemFilterButton system="note" label="Notes" />
            </ScrollView>
          </View>
          
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.secondaryText }]}>日期：</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <DateFilterButton value="all" label="所有时间" />
              <DateFilterButton value="today" label="今天" />
              <DateFilterButton value="week" label="本周" />
              <DateFilterButton value="month" label="本月" />
            </ScrollView>
          </View>
        </View>
      )}
      
      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.recordItem, { backgroundColor: colors.card }]}
              onPress={() => {
                // 查看详情
                Alert.alert('操作详情', item.originalText);
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: getSystemColor(item.targetSystem) }]}>
                <Ionicons name={getSystemIcon(item.targetSystem)} size={20} color="white" />
              </View>
              
              <View style={styles.recordContent}>
                <View style={styles.recordHeader}>
                  <Text style={[styles.operationText, { color: colors.text }]}>
                    {item.operation}
                  </Text>
                  {item.status === 'failure' && (
                    <View style={styles.errorBadge}>
                      <Text style={styles.errorText}>失败</Text>
                    </View>
                  )}
                </View>
                
                <Text style={[styles.recordText, { color: colors.text }]} numberOfLines={1}>
                  "{item.processedText}"
                </Text>
                
                <View style={styles.recordFooter}>
                  <Text style={[styles.timeText, { color: colors.secondaryText }]}>
                    {formatTime(item.timestamp)}
                  </Text>
                  <Text style={[styles.systemText, { color: colors.secondaryText }]}>
                    {getSystemName(item.targetSystem)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={60} color={colors.secondaryText} />
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            没有找到匹配的历史记录
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: colors.error }]}
        onPress={handleClearHistory}
      >
        <Text style={styles.clearButtonText}>清除历史记录</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    width: 60,
    fontSize: 15,
  },
  filterScroll: {
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterButtonText: {
    fontSize: 14,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 80, // 为底部按钮留出空间
  },
  recordItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordContent: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  operationText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  errorBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  errorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  recordText: {
    fontSize: 15,
    marginBottom: 6,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 13,
  },
  systemText: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  clearButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 