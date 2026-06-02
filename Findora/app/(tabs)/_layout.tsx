import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/utils/ThemeContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BUBBLE_SIZE = 50;

const TAB_CONFIG: Record<string, { active: any; inactive: any }> = {
  index:      { active: 'home',        inactive: 'home-outline' },
  feedScreen: { active: 'grid',        inactive: 'grid-outline' },
   shareItem:  { active: 'cloud-upload', inactive: 'cloud-upload-outline' },
  messages:   { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  profile:    { active: 'person',      inactive: 'person-outline' },
  settings:   { active: 'settings',    inactive: 'settings-outline' },
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const visibleRoutes = state.routes.filter((route: any) => {
    const { options } = descriptors[route.key];
    return options.href !== null;
  });

  const tabWidth = SCREEN_WIDTH / visibleRoutes.length;

  useEffect(() => {
    const currentRoute = state.routes[state.index];
    const positionIndex = visibleRoutes.findIndex((r: any) => r.key === currentRoute?.key);
    if (positionIndex === -1) return;

    const targetX = positionIndex * tabWidth + tabWidth / 2 - BUBBLE_SIZE / 2;

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: targetX,
        useNativeDriver: true,
        damping: 14,
        stiffness: 180,
        mass: 0.8,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 10,
          stiffness: 200,
        }),
      ]),
    ]).start();
  }, [state.index]);

  const activeRoute = state.routes[state.index];
  const activeIconName = TAB_CONFIG[activeRoute?.name]?.active ?? 'ellipse';

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.tabBar, borderTopColor: colors.border }]}>
      <Animated.View
        style={[
          styles.bubble,
          { transform: [{ translateX }, { scale: scaleAnim }] },
        ]}
      >
        <Ionicons name={activeIconName} size={24} color="#fff" />
      </Animated.View>

      <View style={styles.tabRow}>
        {visibleRoutes.map((route: any) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);
          const icons = TAB_CONFIG[route.name];
          const icon = icons ? (isFocused ? icons.active : icons.inactive) : 'ellipse-outline';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Ionicons
                name={icon}
                size={22}
                color={isFocused ? 'transparent' : colors.icon}
              />
              {options.title && (
                <Text style={[styles.label, { color: isFocused ? '#6C5CE7' : colors.icon }]}>
                  {options.title}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Tabs.Screen name="index"      options={{ title: 'Home' }} />
        <Tabs.Screen name="feedScreen" options={{ title: 'Items' }} />
            <Tabs.Screen name="shareItem"  options={{ title: 'Share' }} />
        <Tabs.Screen name="messages"   options={{ title: 'Messages' }} />
        <Tabs.Screen name="profile"    options={{ title: 'Profile' }} />
        <Tabs.Screen name="settings"   options={{ title: 'Settings' }} />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 0.5,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
  },
  bubble: {
    position: 'absolute',
    top: -BUBBLE_SIZE / 2,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 10,
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 18,
    paddingBottom: 4,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});