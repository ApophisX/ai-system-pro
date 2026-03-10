import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Input, Switch, Button, Picker } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.less"; // 引入样式文件
import { ContactItem } from "@/types/contact";

// 模拟后端数据存储，实际项目中会调用API
let mockContacts: ContactItem[] = [
  {
    id: "1",
    name: "张建国",
    mobile: "138 0013 8000",
    rawMobile: "13800138000",
    tag: "本人",
    isDefault: true,
  },
  {
    id: "2",
    name: "张小明",
    mobile: "139 1234 5678",
    rawMobile: "13912345678",
    tag: "儿子",
    isDefault: false,
  },
  {
    id: "3",
    name: "李阿姨",
    mobile: "136 6666 8888",
    rawMobile: "13666668888",
    tag: "护工",
    isDefault: false,
  },
];

const ContactEditPage = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactItem>({
    id: "",
    name: "",
    mobile: "",
    rawMobile: "",
    tag: "本人", // 默认本人
    isDefault: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // 删除确认弹窗

  // 常用关系标签
  const relationTags = [
    "本人",
    "儿子",
    "女儿",
    "老伴",
    "兄弟",
    "姐妹",
    "护工",
    "邻居",
    "其他",
  ];

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params;
    const id = params?.id;
    if (id) {
      setIsEditMode(true);
      setContactId(id);
      // 模拟从后端获取数据
      const existingContact = mockContacts.find((c) => String(c.id) === id);
      if (existingContact) {
        setFormData(existingContact);
      } else {
        Taro.showToast({ title: "联系人不存在", icon: "none" });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
      Taro.setNavigationBarTitle({ title: "编辑常用联系人" });
    } else {
      Taro.setNavigationBarTitle({ title: "新增常用联系人" });
    }
  }, []);

  // 表单校验
  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "姓名不能为空";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "手机号不能为空";
    } else if (!/^1[3-9]\d{9}$/.test(formData.rawMobile)) {
      // 校验原始手机号格式
      newErrors.mobile = "手机号格式不正确";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 处理输入框变化
  const handleChange = (key: keyof ContactItem, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // 手机号特殊处理：存储原始值，并格式化显示值
    if (key === "mobile" && typeof value === "string") {
      const rawNum = value.replace(/\s/g, ""); // 移除空格
      setFormData((prev) => ({
        ...prev,
        rawMobile: rawNum,
        mobile: rawNum.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3"), // 格式化为 138 0000 0000
      }));
    }
    // 实时清除对应字段的错误信息
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  // 保存/更新联系人
  const handleSave = async () => {
    if (!validateForm()) {
      Taro.showToast({ title: "请检查输入信息", icon: "none" });
      return;
    }

    if (formData.isDefault) {
      // 如果设置为默认，则其他所有联系人取消默认
      mockContacts = mockContacts.map((c) => ({ ...c, isDefault: false }));
    }

    if (isEditMode && contactId) {
      // 更新现有联系人
      mockContacts = mockContacts.map((c) =>
        String(c.id) === contactId ? { ...formData, id: contactId } : c
      );
      Taro.showToast({ title: "联系人已更新", icon: "success" });
    } else {
      // 新增联系人
      const newId = String(Date.now()); // 简单生成ID
      const newContact = { ...formData, id: newId };
      mockContacts.push(newContact);
      Taro.showToast({ title: "联系人已添加", icon: "success" });
    }

    // 模拟数据更新后，跳转回列表页
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  // 删除联系人
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (contactId) {
      mockContacts = mockContacts.filter((c) => String(c.id) !== contactId);
      Taro.showToast({ title: "联系人已删除", icon: "success" });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col p-4 pb-safe-area">
      {/* 表单项 */}
      <View className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        {/* 姓名 */}
        <View className="form-item mb-5">
          <Text className="label">姓名</Text>
          <Input
            className={`input ${
              errors.name ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="请输入联系人姓名"
            value={formData.name}
            onInput={(e) => handleChange("name", e.detail.value)}
            maxlength={20}
          />
          {errors.name && <Text className="error-message">{errors.name}</Text>}
        </View>

        {/* 手机号 */}
        <View className="form-item mb-5">
          <Text className="label">手机号</Text>
          <Input
            className={`input ${
              errors.mobile ? "border-red-500" : "border-gray-200"
            }`}
            type="number" // 限制数字输入
            placeholder="请输入手机号"
            value={formData.mobile}
            onInput={(e) => handleChange("mobile", e.detail.value)}
            maxlength={13} // 11位数字 + 2个空格
          />
          {errors.mobile && (
            <Text className="error-message">{errors.mobile}</Text>
          )}
        </View>

        {/* 关系标签选择 */}
        <View className="form-item mb-5">
          <Text className="label">与我的关系</Text>
          <View className="flex flex-wrap gap-2">
            {relationTags.map((tag) => (
              <View
                key={tag}
                className={`tag-chip ${
                  formData.tag === tag ? "tag-chip-active" : ""
                }`}
                onClick={() => handleChange("tag", tag)}
              >
                {tag}
              </View>
            ))}
          </View>
        </View>

        {/* 设为默认联系人 */}
        <View className="form-item flex items-center justify-between">
          <Text className="label" style={{ marginBottom: 0 }}>
            设为默认联系人
          </Text>
          <Switch
            checked={formData.isDefault}
            onChange={(e) => handleChange("isDefault", e.detail.value)}
            color="#FF6B00" // 主题色
            className="scale-90" // 稍微缩小一点，更精致
          />
        </View>
      </View>
      {/* 底部操作按钮 */}
      <View className="flex-1"></View> {/* 撑开空间，让按钮沉底 */}
      <View className="fixed bottom-0 left-0 right-0 w-full bg-white px-6 py-4 shadow-lg pb-safe-area flex flex-col gap-3 z-50 rounded-t-2xl">
        <Button
          className="btn-primary w-full h-12 rounded-full  font-bold shadow-orange"
          onClick={handleSave}
        >
          {isEditMode ? "保存修改" : "添加联系人"}
        </Button>

        {true && (
          <Button
            className="btn-danger-outline w-full h-12 rounded-full font-bold"
            onClick={() => {
              Taro.showModal({
                title: "确认删除",
                content: "确定要删除此联系人吗？删除后将无法恢复。",
                confirmText: "确认删除",
                cancelText: "取消",
                confirmColor: "#EE0A24", // 红色警示
                success: (result) => {
                  if (!result.confirm) return;
                  mockContacts = mockContacts.filter(
                    (c) => String(c.id) !== contactId
                  );
                  Taro.showToast({ title: "联系人已删除", icon: "success" });
                  setTimeout(() => {
                    Taro.navigateBack();
                  }, 1000);
                },
              });
            }}
          >
            删除此联系人
          </Button>
        )}
      </View>
    </View>
  );
};

export default ContactEditPage;
