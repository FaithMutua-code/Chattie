import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Image
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { AuthContext } from '@/utils/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../config';
import { useTheme } from '@/utils/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const PURPLE = '#6C5CE7';

export default function MessagesScreen() {
  const { authData } = useContext(AuthContext)!;
  const { colors, isDark } = useTheme();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const token = authData?.token;

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err: any) {
      console.error('Fetch conversations error:', err.response?.data ?? err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    const parts = String(name || 'U').trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  };

  const renderConversation = ({ item }: { item: any }) => {
    const { other_user, last_message } = item;
    
    return (
      <TouchableOpacity
        style={[styles.conversationItem, { borderBottomColor: colors.border }]}
        onPress={() => router.push({
          pathname: `/chat/${other_user.id}`,
          params: { userName: other_user.name }
        })}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: PURPLE }]}>
            <Text style={styles.avatarText}>{getInitials(other_user.name)}</Text>
          </View>
          {/* Online status dot could go here if available */}
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
              {other_user.name}
            </Text>
            <Text style={[styles.timeText, { color: colors.icon }]}>
              {formatTime(last_message.created_at)}
            </Text>
          </View>
          
          <View style={styles.messageRow}>
            <Text style={[styles.lastMessage, { color: colors.subtext }]} numberOfLines={1}>
              {last_message.message}
            </Text>
            {/* Unread indicator could go here */}
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={18} color={colors.icon} />
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        </View>

        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.other_user.id)}
          renderItem={renderConversation}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={80} color={colors.icon} />
              <Text style={[styles.emptyText, { color: colors.subtext }]}>No conversations yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.icon }]}>
                Messages from people you contact about items will appear here.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    marginRight: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});