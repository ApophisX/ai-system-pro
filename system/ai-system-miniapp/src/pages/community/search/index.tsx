/**
 * 社区搜索页 - 搜索并加入社区
 * 顶部：SearchBar
 * 内容：社区列表（List 布局），Mock 数据
 * 私密社区：点击弹出邀请码弹框；公开社区：直接进入
 */

import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import { SearchBar } from '@/components/search-bar';
import { paths } from '@/route/paths';
import Taro, { useLoad } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './index.less';

// ============ MOCK 社区列表数据 ============
type CommunityItem = {
  id: string;
  name: string;
  memberCount: number;
  desc: string;
  isPrivate: boolean; // 私密社区需邀请码，公开社区直接进入
};

const MOCK_COMMUNITIES: CommunityItem[] = [
  { id: 'community-001', name: '无人机爱好者社区', memberCount: 1280, desc: '分享航拍技巧与装备交流', isPrivate: true },
  { id: 'community-002', name: '露营装备租赁圈', memberCount: 856, desc: '户外露营装备共享', isPrivate: false },
  { id: 'community-003', name: '摄影器材交流群', memberCount: 2103, desc: '相机镜头租赁与二手交易', isPrivate: true },
  { id: 'community-004', name: '户外运动俱乐部', memberCount: 542, desc: '徒步、骑行装备租赁', isPrivate: false },
  { id: 'community-005', name: '乐器租赁社区', memberCount: 389, desc: '吉他、钢琴等乐器共享', isPrivate: true },
  { id: 'community-006', name: '数码科技圈', memberCount: 1205, desc: '数码产品租赁与评测', isPrivate: false },
];

function CommunityListItem({ item, onClick }: { item: CommunityItem; onClick: () => void }) {
  return (
    <View
      className="community-list-item flex items-center gap-4 px-4 py-4 bg-white rounded-xl mb-3 active:opacity-90"
      hoverClass="opacity-90"
      onClick={onClick}
    >
      <View className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <Text className="text-2xl">🏘️</Text>
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex items-center gap-2">
          <Text className="text-base font-medium text-gray-900 truncate">{item.name}</Text>
          {item.isPrivate && (
            <View className="invite-tag shrink-0 px-2 py-0.5 rounded-md">
              <Text className="text-xs text-amber-700">私密</Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-gray-500 mt-0.5 line-clamp-1">{item.desc}</Text>
        <Text className="text-xs text-gray-400 mt-1">{item.memberCount} 人已加入</Text>
      </View>
      <Text className="text-emerald-500 text-sm font-medium shrink-0">加入</Text>
    </View>
  );
}

/** 邀请码弹框 - 私密社区进入需输入邀请码 */
function InviteCodeModal({
  visible,
  communityName,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  communityName: string;
  onClose: () => void;
  onConfirm: (code: string) => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setCode('');
      setError('');
    }
  }, [visible]);

  const handlePaste = useCallback(async () => {
    try {
      const res = await Taro.getClipboardData();
      if (res?.data) {
        const val = String(res.data).trim().slice(0, 32);
        setCode(val);
        setError('');
        Taro.showToast({ title: '已粘贴', icon: 'none', duration: 1200 });
      } else {
        Taro.showToast({ title: '剪贴板为空', icon: 'none' });
      }
    } catch {
      Taro.showToast({ title: '粘贴失败', icon: 'none' });
    }
  }, []);

  const handleConfirm = useCallback(() => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('请输入邀请码');
      return;
    }
    setLoading(true);
    setError('');
    onConfirm(trimmed);
    setLoading(false);
  }, [code, onConfirm]);

  const handleClose = useCallback(() => {
    setCode('');
    setError('');
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <View className="invite-modal-mask fixed inset-0 z-50 flex items-center justify-center px-6" catchMove>
      <View className="invite-modal-backdrop absolute inset-0 bg-black/50" onClick={handleClose} />
      <View
        className="invite-modal-content relative z-10 w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部装饰条 */}
        <View className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />
        <View className="p-6">
          {/* 图标与标题 */}
          <View className="flex flex-col items-center mb-6">
            <View className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
              <Text className="text-3xl">🔐</Text>
            </View>
            <Text className="text-lg font-semibold text-gray-900">加入私密社区</Text>
            <Text className="text-sm text-gray-500 mt-1 text-center">{communityName}</Text>
            <Text className="text-xs text-gray-400 mt-2">请输入邀请码以验证身份</Text>
          </View>

          {/* 输入框 + 粘贴按钮 */}
          <View className="invite-input-wrap flex items-center gap-2 mb-4">
            <Input
              className="invite-input flex-1 h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-base"
              placeholder="请输入邀请码"
              placeholderClass="text-gray-400"
              value={code}
              onInput={e => {
                setCode(e.detail.value);
                setError('');
              }}
              maxlength={32}
            />
            <View
              className="invite-paste-btn shrink-0 h-12 px-4 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100"
              hoverClass="opacity-80"
              onClick={handlePaste}
            >
              <Text className="text-emerald-600 text-sm font-medium">粘贴</Text>
            </View>
          </View>
          {error ? <Text className="text-red-500 text-xs mb-2">{error}</Text> : null}

          {/* 按钮组 */}
          <View className="flex gap-3 mt-2">
            <Button
              className="flex-1 h-12 rounded-xl flex items-center justify-center bg-gray-100"
              hoverClass="opacity-90"
              onClick={handleClose}
            >
              <Text className="text-gray-600 font-medium">取消</Text>
            </Button>
            <Button
              className="invite-confirm-btn h-12 rounded-xl flex items-center justify-center bg-emerald-500 text-white font-medium flex-1"
              hoverClass="opacity-90"
              loading={loading}
              disabled={loading}
              onClick={handleConfirm}
            >
              确认加入
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CommunitySearch() {
  const [keyword, setKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityItem | null>(null);

  const filteredList = useMemo(() => {
    if (!keyword.trim()) return MOCK_COMMUNITIES;
    const k = keyword.trim().toLowerCase();
    return MOCK_COMMUNITIES.filter(c => c.name.toLowerCase().includes(k) || c.desc.toLowerCase().includes(k));
  }, [keyword]);

  const handleSearch = useCallback((k: string) => {
    setKeyword(k);
  }, []);

  const handleCommunityClick = useCallback((item: CommunityItem) => {
    if (item.isPrivate) {
      setSelectedCommunity(item);
      setModalVisible(true);
    } else {
      Taro.navigateTo({ url: paths.community.assets(item.id) });
    }
  }, []);

  const handleInviteConfirm = useCallback(
    (_code: string) => {
      if (!selectedCommunity) return;
      // TODO: 调用接口校验邀请码 _code，成功后跳转
      // 当前 Mock：任意非空邀请码均可通过
      Taro.showToast({ title: '验证成功', icon: 'success' });
      setModalVisible(false);
      setSelectedCommunity(null);
      Taro.navigateTo({ url: paths.community.assets(selectedCommunity.id) });
    },
    [selectedCommunity],
  );

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedCommunity(null);
  }, []);

  useLoad(() => {
    Taro.setNavigationBarTitle({ title: '搜索社区' });
  });

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
      <SearchBar placeholder="搜索社区名称、关键词..." defaultValue={keyword} onSearch={handleSearch} />
      <ScrollView scrollY enhanced showScrollbar={false} className="flex-1 px-4 py-4">
        {filteredList.length > 0 ? (
          <View className="pb-4">
            {filteredList.map(item => (
              <CommunityListItem key={item.id} item={item} onClick={() => handleCommunityClick(item)} />
            ))}
          </View>
        ) : (
          <View className="flex flex-col items-center justify-center py-24">
            <Text className="text-5xl mb-4">🔍</Text>
            <Text className="text-gray-500 text-sm">暂无匹配的社区</Text>
            <Text className="text-gray-400 text-xs mt-2">试试其他关键词</Text>
          </View>
        )}
      </ScrollView>

      <InviteCodeModal
        visible={modalVisible}
        communityName={selectedCommunity?.name ?? ''}
        onClose={handleModalClose}
        onConfirm={handleInviteConfirm}
      />
    </View>
  );
}
