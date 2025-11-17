<template>
  <div class="create-page">
    <van-nav-bar 
      title="创建线索"
    >
      <template #left>
        <div class="custom-back-btn" @click.stop.prevent="testClick" @mousedown="testMouseDown">
          <i class="fas fa-chevron-left"></i>
        </div>
      </template>
    </van-nav-bar>
    
    <div class="create-content">
      <van-form @submit="handleSubmit" ref="form" class="unified-form" :show-error="showFormErrors" validate-trigger="">
        <!-- 线索标题 -->
        <van-field
          v-model="form.title"
          name="title"
          label="线索标题"
          placeholder="给你的线索起个有趣的标题"
          :rules="[{ required: true, message: '请输入线索标题' }]"
          maxlength="50"
          show-word-limit
        />

        <!-- 线索类型选择 -->
        <div class="simple-type-selector">
          <label class="field-label">线索类型*</label>
          <div class="type-field" @click="showTypeDropdown = !showTypeDropdown">
            <span>{{ typeText }}</span>
            <span>▼</span>
          </div>
          
          <!-- 强制显示的下拉列表 -->
          <div v-show="showTypeDropdown" class="simple-dropdown">
            <div @click="selectTypeSimple('TEXT')" class="simple-option">文字线索</div>
            <div @click="selectTypeSimple('IMAGE')" class="simple-option">图片线索</div>
            <div @click="selectTypeSimple('AUDIO')" class="simple-option">音频线索</div>
          </div>
        </div>
        


        <!-- 难度级别选择 -->
        <van-field
          :value="difficultyText"
          name="difficulty"
          label="难度级别"
          placeholder="选择难度级别"
          readonly
          is-link
          @click="handleDifficultyClick"
          :rules="[{ required: true, message: '请选择难度级别' }]"
        />
        

        
        <!-- 文字内容 -->
        <van-field
          v-if="form.type === 'TEXT' || form.type === ''"
          v-model="form.content.text"
          name="content.text"
          type="textarea"
          label="线索内容"
          placeholder="输入你的线索内容，让它充满悬念..."
          :rules="textContentRules"
          rows="4"
          maxlength="500"
          show-word-limit
        />

        <!-- 图片上传 -->
        <div v-if="form.type === 'IMAGE'" class="upload-field">
          <label class="field-label">图片线索*</label>
          <van-uploader
            v-model="imageFiles"
            :max-count="1"
            :after-read="handleImageUpload"
            :before-delete="handleImageDelete"
            accept="image/*"
            class="custom-uploader"
          >
            <van-icon name="plus" class="upload-plus-icon" />
          </van-uploader>
        </div>

        <!-- 音频上传 -->
        <div v-if="form.type === 'AUDIO'" class="upload-field">
          <label class="field-label">音频线索*</label>
          <van-uploader
            v-model="audioFiles"
            :max-count="1"
            :after-read="handleAudioUpload"
            :before-delete="handleAudioDelete"
            accept="audio/*"
            class="custom-uploader"
          >
            <van-icon name="plus" class="upload-plus-icon" />
          </van-uploader>
        </div>

        <!-- 解密答案 -->
        <van-field
          v-model="form.solution"
          name="solution"
          label="解密答案"
          placeholder="设置解密答案"
          :rules="[{ required: true, message: '请输入解密答案' }]"
          maxlength="100"
        />

        <!-- 提示设置 -->
        <div class="hints-container">
          <div class="hints-header">
            <label class="field-label">提示设置</label>
            <van-button 
              type="primary" 
              size="mini" 
              @click="addHint"
              :disabled="form.hints.length >= 3"
              class="add-hint-btn"
            >
              添加提示
            </van-button>
          </div>
          
          <div v-for="(hint, index) in form.hints" :key="index" class="hint-field">
            <van-field
              v-model="form.hints[index]"
              :name="`hints.${index}`"
              :label="`提示 ${index + 1}`"
              placeholder="输入提示内容"
              maxlength="100"
            >
              <template #button>
                <van-button 
                  size="mini" 
                  type="danger" 
                  @click="removeHint(index)"
                  class="remove-hint-btn"
                >
                  删除
                </van-button>
              </template>
            </van-field>
          </div>
        </div>

        <!-- 标签设置 -->
        <van-field
          v-model="tagsInput"
          name="tags"
          label="标签"
          placeholder="输入标签，用逗号分隔"
          @blur="handleTagsInput"
          maxlength="100"
        />
        
        <div v-if="form.tags.length > 0" class="tags-display">
          <van-tag 
            v-for="(tag, index) in form.tags" 
            :key="index"
            closeable
            @close="removeTag(index)"
            class="tag-item"
          >
            {{ tag }}
          </van-tag>
        </div>

        <!-- 过期时间设置 -->
        <van-field
          :value="expiresAtText"
          name="expiresAt"
          label="过期时间"
          placeholder="选择过期时间（可选）"
          readonly
          is-link
          @click="handleDateClick"
        />

        <!-- 提交按钮 -->
        <div class="submit-section">
          <van-button 
            type="primary" 
            native-type="submit" 
            block 
            :loading="submitting"
            :disabled="submitting"
          >
            {{ submitting ? '创建中...' : '创建线索' }}
          </van-button>
        </div>
      </van-form>
    </div>



    <!-- 难度选择器 -->
    <div v-if="showDifficultyPicker" class="difficulty-picker-overlay">
      <!-- 蒙层背景 -->
      <div class="overlay-mask" @click="closeDifficultyPicker"></div>
      
      <!-- 选择器内容 -->
      <div class="difficulty-selector">
        <div class="selector-header">
          <span class="cancel-btn" @click="closeDifficultyPicker">取消</span>
          <span class="title">选择难度级别</span>
          <span class="confirm-btn" @click="closeDifficultyPicker">确定</span>
        </div>
        <div class="selector-content">
          <div 
            v-for="item in difficultyActions" 
            :key="item.value"
            class="difficulty-option"
            :class="{ active: form.difficulty === item.value }"
            @click="selectDifficulty(item)"
          >
            <span class="option-text">{{ item.name }}</span>
            <i v-if="form.difficulty === item.value" class="fas fa-check option-check"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 日期选择器 -->
    <div v-if="showDatePicker" class="calendar-overlay" @click.self="onClose">
      <!-- 蒙层背景 -->
      <div class="overlay-mask" @click.stop="onClose"></div>
      
      <!-- 日历容器 -->
      <div class="calendar-container" @click.stop>
        <van-calendar 
          :show="true"
          @close="onClose" 
          @select="onDateSelect"
          :min-date="minDate"
          :max-date="maxDate"
          :default-date="defaultDate"
          :formatter="dateFormatter"
          title="选择过期时间"
          :show-confirm="false"
          :poppable="false"
          :safe-area-inset-bottom="true"
          :show-mark="true"
          :show-title="true"
          :show-subtitle="true"
          :allow-same-day="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import clueApi from '@/api/clue';
import { Toast } from 'vant';

export default {
  name: 'Create',
  data() {
    return {
      submitting: false,
      showTypeDropdown: false,
      showDifficultyPicker: false,
      showDatePicker: false,
      showFormErrors: false,
      
      // 表单数据
      form: {
        title: '',
        type: '',
        difficulty: '',
        content: {
          text: '',
          imageUrl: '',
          audioUrl: ''
        },
        solution: '',
        hints: [],
        tags: [],
        expiresAt: null
      },
      
      // 文件上传
      imageFiles: [],
      audioFiles: [],
      
      // 标签输入
      tagsInput: '',
      
      // 日期选择
      selectedDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 默认明天
      minDate: new Date(),
      maxDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 最大一年后
      
      // 选择器选项
      typeOptions: [
        { text: '文字线索', value: 'TEXT' },
        { text: '图片线索', value: 'IMAGE' },
        { text: '音频线索', value: 'AUDIO' }
      ],
      
      difficultyActions: [
        { name: '简单 (5次机会)', value: 'EASY' },
        { name: '中等 (3次机会)', value: 'MEDIUM' },
        { name: '困难 (2次机会)', value: 'HARD' }
      ]
    };
  },
  
  computed: {
    typeText() {
      const type = this.typeOptions.find(item => item.value === this.form.type);
      const result = type ? type.text : '请选择线索类型';
      console.log('typeText 计算:', this.form.type, '->', result);
      return result;
    },
    
    difficultyText() {
      const difficulty = this.difficultyActions.find(item => item.value === this.form.difficulty);
      return difficulty ? difficulty.name : '';
    },
    
    expiresAtText() {
      if (!this.form.expiresAt) return '';
      return this.formatDate(this.form.expiresAt);
    },
    
    textContentRules() {
      if (this.form.type === 'TEXT') {
        return [{ required: true, message: '请输入文字内容' }];
      }
      return [];
    },
    
    defaultDate() {
      // 如果已经选择了日期，则定位到该日期；否则定位到当前日期
      return this.form.expiresAt || new Date();
    },
    

  },
  
  mounted() {
    // 添加全局点击监听，用于关闭下拉列表
    document.addEventListener('click', this.handleClickOutside);
  },
  
  beforeDestroy() {
    // 移除全局点击监听
    document.removeEventListener('click', this.handleClickOutside);
  },
  
  methods: {
    testClick() {
      console.log('🔥 testClick 被调用了！');
      this.handleBack();
    },
    
    testMouseDown() {
      console.log('🔥 testMouseDown 被调用了！');
    },
    
    handleBack() {
      console.log('handleBack 被调用');
      
      try {
        // 检查是否有历史记录可以返回
        if (window.history.length > 1) {
          console.log('使用 router.go(-1) 返回');
          this.$router.go(-1);
        } else {
          console.log('跳转到发现页面');
          this.$router.push('/discover');
        }
      } catch (error) {
        console.error('返回操作失败:', error);
        // 如果出错，强制跳转到发现页面
        this.$router.push('/discover');
      }
    },
    
    // 切换下拉列表显示
    toggleTypeDropdown() {
      console.log('切换下拉列表，当前状态:', this.showTypeDropdown);
      this.showTypeDropdown = !this.showTypeDropdown;
      console.log('切换后状态:', this.showTypeDropdown);
      console.log('typeOptions:', this.typeOptions);
    },
    
    // 简单选择类型
    selectTypeSimple(value) {
      console.log('选择类型:', value);
      this.form.type = value;
      this.showTypeDropdown = false;
      this.handleTypeChange(value);
    },
    
    // 点击外部关闭下拉列表
    handleClickOutside(event) {
      const wrapper = this.$el.querySelector('.type-selector-wrapper');
      if (wrapper && !wrapper.contains(event.target)) {
        this.showTypeDropdown = false;
      }
    },
    
    // 日期格式化器 - 用于高亮选中的日期
    dateFormatter(day) {
      if (this.form.expiresAt) {
        const selectedDate = new Date(this.form.expiresAt);
        const currentDate = new Date(day.date);
        
        // 比较年月日是否相同
        if (selectedDate.getFullYear() === currentDate.getFullYear() &&
            selectedDate.getMonth() === currentDate.getMonth() &&
            selectedDate.getDate() === currentDate.getDate()) {
          day.className = 'selected-date';
        }
      }
      return day;
    },

    
    // 处理类型变化
    handleTypeChange(value) {
      console.log('类型选择变化:', value);
      console.log('当前 form.type:', this.form.type);
      
      // v-model 会自动更新 form.type，这里只需要清空其他类型的内容
      // 清空其他类型的内容
      if (value !== 'TEXT') {
        this.form.content.text = '';
      }
      if (value !== 'IMAGE') {
        this.form.content.imageUrl = '';
        this.imageFiles = [];
      }
      if (value !== 'AUDIO') {
        this.form.content.audioUrl = '';
        this.audioFiles = [];
      }
    },
    
    // 处理难度字段点击
    handleDifficultyClick() {
      console.log('点击难度字段，打开选择器');
      this.showDifficultyPicker = true;
    },
    
    // 处理日期字段点击
    // 处理日期字段点击 - 对应小程序的 onDisplay
    handleDateClick() {
      this.showDatePicker = true;
    },
    
    // 关闭难度选择器
    closeDifficultyPicker() {
      this.showDifficultyPicker = false;
    },
    
    // 关闭日期选择器 - 对应小程序的 onClose
    onClose() {
      this.showDatePicker = false;
    },
    
    // 选择难度
    selectDifficulty(item) {
      console.log('选择难度:', item);
      this.form.difficulty = item.value;
      this.showDifficultyPicker = false;
    },
    
    // 难度选择 (ActionSheet - 备用)
    onDifficultySelect(action) {
      this.form.difficulty = action.value;
      this.showDifficultyPicker = false;
    },
    
     formatDate(date) {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
    onDateSelect(date) {
      this.showDatePicker = false;
      // v-model 会自动更新 form.expiresAt，但为了确保一致性，我们手动设置
      this.form.expiresAt = date;
      console.log('选择的日期:', date);
    },
    
    // 图片上传
    async handleImageUpload(file) {
      try {
        // 这里应该调用文件上传API
        // 暂时使用本地URL作为占位符
        const imageUrl = URL.createObjectURL(file.file);
        this.form.content.imageUrl = imageUrl;
        Toast.success('图片上传成功');
      } catch (error) {
        console.error('图片上传失败:', error);
        Toast.fail('图片上传失败');
      }
    },
    
    handleImageDelete() {
      this.form.content.imageUrl = '';
    },
    
    // 音频上传
    async handleAudioUpload(file) {
      try {
        // 这里应该调用文件上传API
        // 暂时使用本地URL作为占位符
        const audioUrl = URL.createObjectURL(file.file);
        this.form.content.audioUrl = audioUrl;
        Toast.success('音频上传成功');
      } catch (error) {
        console.error('音频上传失败:', error);
        Toast.fail('音频上传失败');
      }
    },
    
    handleAudioDelete() {
      this.form.content.audioUrl = '';
    },
    
    // 提示管理
    addHint() {
      if (this.form.hints.length < 3) {
        this.form.hints.push('');
      }
    },
    
    removeHint(index) {
      this.form.hints.splice(index, 1);
    },
    
    // 标签管理
    handleTagsInput() {
      if (this.tagsInput.trim()) {
        const tags = this.tagsInput.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag && !this.form.tags.includes(tag));
        
        this.form.tags = [...this.form.tags, ...tags].slice(0, 5); // 最多5个标签
        this.tagsInput = '';
      }
    },
    
    removeTag(index) {
      this.form.tags.splice(index, 1);
    },
    
    // 表单验证
    validateForm() {
      // 基础字段验证
      if (!this.form.title.trim()) {
        Toast.fail('请输入线索标题');
        return false;
      }
      
      if (!this.form.type) {
        Toast.fail('请选择线索类型');
        return false;
      }
      
      if (!this.form.difficulty) {
        Toast.fail('请选择难度级别');
        return false;
      }
      
      if (!this.form.solution.trim()) {
        Toast.fail('请输入解密答案');
        return false;
      }
      
      // 内容验证
      switch (this.form.type) {
        case 'TEXT':
          if (!this.form.content.text.trim()) {
            Toast.fail('请输入文字内容');
            return false;
          }
          break;
        case 'IMAGE':
          if (!this.form.content.imageUrl) {
            Toast.fail('请上传图片');
            return false;
          }
          break;
        case 'AUDIO':
          if (!this.form.content.audioUrl) {
            Toast.fail('请上传音频');
            return false;
          }
          break;
      }
      
      return true;
    },
    
    // 提交表单
    async handleSubmit() {
      console.log('handleSubmit 被调用');
      
      // 启用错误显示
      this.showFormErrors = true;
      
      // 使用 Vant 表单验证
      try {
        await this.$refs.form.validate();
        console.log('Vant 表单验证通过');
      } catch (error) {
        console.log('Vant 表单验证失败:', error);
        // 验证失败，错误已经显示
        return;
      }
      
      if (!this.validateForm()) {
        console.log('自定义表单验证失败');
        return;
      }
      
      console.log('开始提交表单');
      this.submitting = true;
      
      try {
        // 准备提交数据
        const submitData = {
          title: this.form.title.trim(),
          type: this.form.type,
          difficulty: this.form.difficulty,
          content: {},
          solution: this.form.solution.trim(),
          hints: this.form.hints.filter(hint => hint.trim()),
          tags: this.form.tags,
          expiresAt: this.form.expiresAt
        };
        
        // 根据类型设置内容
        switch (this.form.type) {
          case 'TEXT':
            submitData.content.text = this.form.content.text.trim();
            break;
          case 'IMAGE':
            submitData.content.imageUrl = this.form.content.imageUrl;
            break;
          case 'AUDIO':
            submitData.content.audioUrl = this.form.content.audioUrl;
            break;
        }
        
        console.log('准备调用 API，提交数据:', submitData);
        const result = await clueApi.createClue(submitData);
        console.log('API 调用结果:', result);
        
        if (result.success) {
          Toast.success('线索创建成功！');
          
          // 跳转到线索详情页或发现页
          this.$router.push({
            name: 'ClueDetail',
            params: { id: result.data.id }
          }).catch(() => {
            // 如果路由不存在，跳转到发现页
            this.$router.push({ name: 'Discover' });
          });
        } else {
          console.log('API 返回失败:', result.message);
          Toast.fail(result.message);
        }
      } catch (error) {
        console.error('创建线索失败:', error);
        Toast.fail('创建线索失败，请重试');
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.create-page {
  min-height: 100vh;
  background: #ffffff;
  position: relative;
}

// 简单直接的类型选择器样式
.simple-type-selector {
  margin: 32px 0;
  position: relative;
  
  .field-label {
    color: #2c3e50;
    font-weight: 700;
    font-size: 16px;
    margin-bottom: 12px;
    display: block;
    
    &::after {
      content: '*';
      color: #e74c3c;
      margin-left: 4px;
    }
  }
  
  .type-field {
    height: 56px;
    background: #ffffff;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    
    &:hover {
      background: #f8f9fa;
      border-color: #1989fa;
    }
  }
  
  .simple-dropdown {
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 9999 !important;
    background: white !important;
    border: 2px solid #1989fa !important;
    border-radius: 8px !important;
    margin-top: 4px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
    
    .simple-option {
      padding: 16px 20px !important;
      cursor: pointer !important;
      border-bottom: 1px solid #f0f0f0 !important;
      background: white !important;
      color: #333 !important;
      font-size: 16px !important;
      
      &:hover {
        background: #f8f9fa !important;
      }
      
      &:last-child {
        border-bottom: none !important;
      }
    }
  }
}

// 导航栏样式
:deep(.van-nav-bar) {
  background: #ffffff !important;
  border-bottom: 1px solid #f0f0f0;
  height: 64px !important;
  position: relative !important;
  z-index: 100 !important;
  
  .van-nav-bar__content {
    height: 64px !important;
    display: flex !important;
    align-items: center !important;
    position: relative !important;
    z-index: 101 !important;
  }
  
  .van-nav-bar__left {
    display: flex !important;
    align-items: center !important;
    padding-left: 16px !important;
    position: relative !important;
    z-index: 999 !important;
    pointer-events: auto !important;
  }
  
  .custom-back-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.3s ease;
    padding: 8px !important;
    border-radius: 50%;
    width: 40px !important;
    height: 40px !important;
    position: relative !important;
    z-index: 1000 !important;
    pointer-events: auto !important;
    background: rgba(255, 255, 255, 0.1) !important;
    border: 2px solid #1989fa !important;
    
    i {
      color: #1989fa !important;
      font-size: 20px !important;
      transition: all 0.3s ease;
      pointer-events: none !important;
    }
    
    &:hover {
      background: rgba(25, 137, 250, 0.2) !important;
      transform: translateX(-2px);
      
      i {
        color: #07c160 !important;
      }
    }
    
    &:active {
      transform: translateX(-1px) scale(0.95);
      background: rgba(25, 137, 250, 0.3) !important;
    }
  }
  
  .van-nav-bar__title {
    color: #323233;
    font-weight: 700;
    font-size: 20px;
    text-align: center;
    width: 100%;
    letter-spacing: 0.5px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -8px;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(135deg, #1989fa, #07c160);
      border-radius: 2px;
    }
  }
}

.create-content {
  min-height: calc(100vh - 64px);
  padding: 0;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px 16px;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #323233;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 250, 0.95) 100%);
  border-bottom: 1px solid rgba(235, 237, 240, 0.8);
  position: relative;
  text-align: left;
  
  &::after {
    content: '';
    position: absolute;
    left: 28px;
    bottom: 8px;
    width: 40px;
    height: 3px;
    background: linear-gradient(135deg, #1989fa, #07c160);
    border-radius: 2px;
  }
  
  .van-button {
    background: linear-gradient(135deg, #1989fa, #07c160);
    border: none;
    border-radius: 20px;
    padding: 8px 20px;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
    }
    
    &:disabled {
      background: #c8c9cc;
      box-shadow: none;
      transform: none;
    }
  }
}

// 统一表单样式
.unified-form {
  background: #ffffff;
  min-height: calc(100vh - 64px);
  padding: 32px 24px;
}

// 类型选择器包装样式
.type-selector-wrapper {
  margin: 32px 0;
  position: relative; // 确保下拉列表相对于此元素定位
  
  .field-label {
    color: #2c3e50;
    font-weight: 700;
    font-size: 16px;
    margin-bottom: 12px;
    display: block;
    letter-spacing: 0.3px;
    
    &::after {
      content: '*';
      color: #e74c3c;
      margin-left: 4px;
      font-weight: 600;
    }
  }
  
  .type-selector-field {
    height: 56px;
    background: #ffffff;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #f8f9fa;
      border-color: #1989fa;
    }
    
    .type-selector-text {
      color: #2c3e50;
      font-size: 16px;
      line-height: 1.6;
      flex: 1;
      
      &.placeholder {
        color: #95a5a6;
      }
    }
    
    .type-selector-arrow {
      color: #6c757d;
      font-size: 12px;
      transition: transform 0.3s ease;
      
      &.rotated {
        transform: rotate(180deg);
      }
    }
  }
  
  .type-dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-top: 2px;
    overflow: hidden;
    
    .type-dropdown-option {
      padding: 14px 16px;
      font-size: 16px;
      color: #333333;
      cursor: pointer;
      transition: background-color 0.2s ease;
      border-bottom: 1px solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background-color: #f8f9fa;
      }
      
      &:active {
        background-color: #e9ecef;
      }
    }
  }
  
  :deep(.van-dropdown-menu) {
    .van-dropdown-menu__bar {
      height: 56px;
      background: #ffffff;
      border: 2px solid #e9ecef;
      border-radius: 12px;
    }
    
    .van-dropdown-menu__item {
      padding: 16px 20px;
      
      .van-dropdown-menu__title {
        color: #2c3e50;
        font-size: 16px;
        line-height: 1.6;
      }
    }
  }
  
  // 下拉选项浮层样式 - 相对定位，跟随输入框
  :deep(.van-dropdown-item) {
    position: absolute !important;
    top: 100% !important; 
    left: 0 !important;
    width: 100% !important; // 宽度与输入框一致
    z-index: 1000 !important;
    background: #ffffff !important;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
    margin-top: 2px;
    transform: none !important;
    
    .van-dropdown-item__content {
      max-height: 200px;
      overflow-y: auto;
      background: #ffffff;
      border-radius: 7px;
    }
    
    .van-dropdown-item__option {
      padding: 14px 16px;
      font-size: 16px;
      color: #333333;
      background: transparent;
      border-bottom: none !important; // 移除所有分隔线
      transition: background-color 0.2s ease;
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
      
      &:hover {
        background-color: #f8f9fa;
      }
      
      &.van-dropdown-item__option--active {
        color: #1989fa;
        background-color: #f0f8ff;
        font-weight: 500;
      }
    }
  }
}

// 全局覆盖 Vant 下拉菜单的定位样式，确保相对于父元素定位
:deep(.van-dropdown-item) {
  position: absolute !important;
  // 确保不会被设置为 fixed 定位
  &.van-popup--fixed {
    position: absolute !important;
  }
  // 强制覆盖任何内联样式的 fixed 定位
  &[style*="position: fixed"] {
    position: absolute !important;
  }
}

// 确保下拉菜单的父容器有正确的定位上下文
:deep(.van-dropdown-menu) {
  position: relative !important; // 确保作为定位上下文
  
  .van-dropdown-item {
    position: absolute !important;
    // 相对于 .van-dropdown-menu 定位，而不是页面
    top: 100% !important;
    left: 0 !important;
    width: 100% !important;
  }
}

// 上传字段样式
.upload-field {
  margin: 32px 0;
  
  .field-label {
    color: #2c3e50;
    font-weight: 700;
    font-size: 16px;
    margin-bottom: 12px;
    display: block;
    letter-spacing: 0.3px;
    
    &::after {
      content: '*';
      color: #e74c3c;
      margin-left: 4px;
      font-weight: 600;
    }
  }
  
  .custom-uploader {
    width: 100%;
    
    :deep(.van-uploader__upload) {
      width: 120px;
      height: 120px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        border-color: #1989fa;
        background: #f8f9fa;
      }
      
      .van-icon {
        font-size: 40px;
        color: #666666;
        font-weight: bold;
        
        &:hover {
          color: #1989fa;
        }
      }
    }
    
    // 隐藏默认的上传图标和文字
    :deep(.van-uploader__upload-icon) {
      display: none;
    }
    
    :deep(.van-uploader__upload-text) {
      display: none;
    }
  }
}

// 提示设置容器
.hints-container {
  margin: 32px 0;
  
  .hints-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .field-label {
      color: #2c3e50;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.3px;
      margin: 0;
    }
    
    .add-hint-btn {
      background: linear-gradient(135deg, #1989fa, #07c160);
      border: none;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);
    }
  }
  
  .hint-field {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .remove-hint-btn {
      background: linear-gradient(135deg, #ff6b6b, #ee5a52);
      border: none;
      border-radius: 16px;
      font-size: 12px;
      padding: 4px 12px;
    }
  }
}

// 移除了不需要的卡片样式

.tags-display {
  margin: 16px 0 32px 0;
  padding: 16px 0;
  
  .tag-item {
    margin: 8px 10px 8px 0;
    background: linear-gradient(135deg, #1989fa, #07c160);
    color: white;
    border: none;
    border-radius: 25px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(25, 137, 250, 0.25);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }
    
    &:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px rgba(25, 137, 250, 0.35);
      
      &::before {
        left: 100%;
      }
    }
    
    :deep(.van-tag__close) {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin-left: 8px;
      padding: 2px;
      border-radius: 50%;
      transition: all 0.3s ease;
      
      &:hover {
        color: white;
        background: rgba(255, 255, 255, 0.25);
        transform: scale(1.2);
      }
    }
  }
}

.submit-section {
  padding: 32px 24px;
  display: flex;
  justify-content: center;
  
  .van-button {
    background: linear-gradient(135deg, #1989fa, #07c160);
    border: none;
    border-radius: 25px;
    height: 52px;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(25, 137, 250, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    width: calc(100% - 32px);
    max-width: 320px;
    margin: 0 16px;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(25, 137, 250, 0.4);
      
      &::before {
        left: 100%;
      }
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      background: linear-gradient(135deg, #c8c9cc, #969799);
      box-shadow: none;
      transform: none;
      
      &::before {
        display: none;
      }
    }
  }
}

// 表单样式优化 - 统一的现代化设计
:deep(.van-field) {
  background: transparent;
  border: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  margin: 32px 0;
  position: relative;
  
  .van-field__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  // 选择器字段特殊样式
  &[readonly] {
    cursor: pointer;
    
    .van-field__control {
      cursor: pointer;
      background: #f8f9fa;
      border-color: #dee2e6;
      position: relative;
      pointer-events: auto; // 修改为auto，允许点击事件
      
      &:hover {
        background: #e9ecef;
        border-color: #1989fa;
      }
      
      &::after {
        content: '▼';
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #6c757d;
        font-size: 12px;
        pointer-events: none;
      }
    }
  }
}

:deep(.van-field__label) {
  color: #2c3e50;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 12px;
  display: block;
  letter-spacing: 0.3px;
  
  &::after {
    content: '*';
    color: #e74c3c;
    margin-left: 4px;
    font-weight: 600;
  }
}

:deep(.van-field__control) {
  color: #2c3e50;
  font-size: 16px;
  padding: 16px 20px;
  background: #ffffff;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
  line-height: 1.6;
  min-height: 56px;
  
  &::placeholder {
    color: #95a5a6;
    font-size: 15px;
    font-weight: 400;
  }
  
  &:focus {
    border-color: #1989fa;
    box-shadow: 0 0 0 3px rgba(25, 137, 250, 0.1);
    outline: none;
  }
  
  &:hover {
    border-color: #bdc3c7;
  }
}

:deep(.van-field__word-limit) {
  color: #7f8c8d;
  font-size: 13px;
  margin-top: 8px;
  text-align: right;
  font-weight: 500;
}

:deep(.van-field__error-message) {
  margin-top: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  border-left: 3px solid #e74c3c;
}

:deep(.van-field__button) {
  margin-left: 16px;
}



// 选择器样式
:deep(.van-popup) {
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  max-height: 50vh;
  z-index: 9999 !important;
}

// 确保选择器显示在正确位置
:deep(.van-popup--bottom) {
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  position: fixed !important;
}

// 覆盖层样式
:deep(.van-overlay) {
  z-index: 9998 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
}





:deep(.van-picker) {
  background: #ffffff;
  
  .van-picker__toolbar {
    background: #ffffff;
    border-bottom: 1px solid #f0f0f0;
    padding: 16px;
  }
  
  .van-picker__confirm {
    color: #1989fa;
    font-weight: 600;
  }
  
  .van-picker__cancel {
    color: #969799;
  }
  
  .van-picker__title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
  
  .van-picker__columns {
    padding: 0 16px;
  }
}

:deep(.van-datetime-picker) {
  background: #ffffff;
  
  .van-picker__toolbar {
    background: #ffffff;
    border-bottom: 1px solid #f0f0f0;
    padding: 16px;
  }
  
  .van-picker__title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }
  
  .van-picker__columns {
    padding: 0 16px;
  }
}

// 日历组件样式修复 - 修复布局和背景问题
:deep(.van-calendar) {
  background: white !important;
  border-radius: 20px 20px 0 0;
  overflow: visible !important;
  height: auto !important;
  max-height: none !important;
  
  // 头部样式
  .van-calendar__header {
    background: #1989fa !important;
    color: white !important;
    border-radius: 20px 20px 0 0;
    
    .van-calendar__header-title {
      color: white !important;
      font-weight: 600;
    }
    
    .van-calendar__header-subtitle {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    // 月份切换按钮
    .van-calendar__header-action {
      color: white !important;
      cursor: pointer !important;
      padding: 8px !important;
      border-radius: 4px !important;
      transition: all 0.3s ease !important;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1) !important;
      }
      
      &:active {
        background: rgba(255, 255, 255, 0.2) !important;
        transform: scale(0.95);
      }
    }
    
    // 左右箭头按钮
    .van-calendar__prev-month,
    .van-calendar__next-month {
      color: white !important;
      font-size: 18px !important;
      cursor: pointer !important;
      padding: 12px !important;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 50%;
      }
    }
  }
  
  // 星期标题行 - 确保横向排列
  .van-calendar__weekdays {
    display: flex !important;
    background: #f8f9fa !important;
    
    .van-calendar__weekday {
      flex: 1 !important;
      text-align: center !important;
      color: #666 !important;
      font-weight: 500;
      padding: 12px 0 !important;
    }
  }
  
  // 月份容器
  .van-calendar__month {
    background: white !important;
  }
  
  // 月份标题
  .van-calendar__month-title {
    background: #fafafa !important;
    color: #323233 !important;
    font-weight: 600;
    padding: 12px 16px !important;
  }
  
  // 日期行容器 - 关键修复：确保横向排列
  .van-calendar__days {
    display: flex !important;
    flex-wrap: wrap !important;
    background: white !important;
  }
  
  // 单个日期 - 确保正确的宽度和布局
  .van-calendar__day {
    width: 14.285% !important; // 7天一行，每天占1/7
    height: 44px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: white !important;
    color: #323233 !important;
    cursor: pointer !important;
    box-sizing: border-box !important;
    
    // 普通日期悬停效果
    &:hover {
      background: rgba(25, 137, 250, 0.1) !important;
    }
    
    // 选中的日期
    &--selected {
      background: #1989fa !important;
      color: white !important;
      border-radius: 6px;
    }
    
    // 今天
    &--today {
      color: #1989fa !important;
      font-weight: 600;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 6px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        background: #1989fa;
        border-radius: 50%;
      }
    }
    
    // 禁用的日期
    &--disabled {
      color: #c8c9cc !important;
      background: white !important;
      cursor: not-allowed !important;
    }
    
    // 自定义选中日期样式
    &.selected-date {
      background: #1989fa !important;
      color: white !important;
      border-radius: 6px !important;
      font-weight: 600 !important;
    }
  }
  
  // 月份导航
  .van-calendar__month-mark {
    color: #1989fa !important;
    font-weight: 600;
  }
  
  // 底部按钮区域
  .van-calendar__footer {
    background: white !important;
    border-top: 1px solid #f0f0f0;
    padding: 16px;
  }
  
  // 确认按钮
  .van-calendar__confirm {
    background: #1989fa !important;
    color: white !important;
    border: none !important;
    font-size: 16px;
    font-weight: 600;
    height: 50px;
    border-radius: 25px;
    margin: 0 16px;
    
    &:hover {
      background: #1677d9 !important;
    }
    
    &:active {
      transform: scale(0.98);
    }
    
    &--disabled {
      background: #c8c9cc !important;
    }
  }
  
  // 月份切换和滚动
  .van-calendar__body {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    max-height: 60vh !important;
    -webkit-overflow-scrolling: touch; // iOS 平滑滚动
  }
  
  // 月份列表容器
  .van-calendar__months {
    overflow: visible !important;
  }
  
  // 单个月份容器
  .van-calendar__month {
    overflow: visible !important;
  }
}

// 日历蒙层样式
.calendar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  
  // 蒙层背景
  .overlay-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    animation: fadeIn 0.3s ease-out;
  }
  
  // 日历容器
  .calendar-container {
    position: relative;
    width: 100%;
    background: white;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease-out;
    max-height: 85vh;
    overflow: visible; // 允许内容溢出
    display: flex;
    flex-direction: column;
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 全局修复日历布局
.van-calendar {
  z-index: 2000 !important;
  background: white !important;
  
  // 确保触摸滑动正常工作
  * {
    touch-action: pan-y !important;
  }
}

// 修复可能阻止滑动的样式
.calendar-overlay {
  // 确保蒙层不阻止内部滑动
  .overlay-mask {
    pointer-events: auto;
  }
  
  .calendar-container {
    pointer-events: auto;
    
    // 确保日历内容可以滚动
    .van-calendar {
      pointer-events: auto;
      touch-action: pan-y;
    }
  }
}

// 上传组件样式增强
:deep(.van-uploader__upload-icon) {
  font-size: 28px;
  color: #1989fa;
  transition: all 0.3s ease;
}

:deep(.van-uploader__upload:hover .van-uploader__upload-icon) {
  transform: scale(1.1);
  color: #07c160;
}

// 文本域样式
:deep(.van-field__control[type="textarea"]) {
  min-height: 140px;
  line-height: 1.7;
  resize: none;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  &::placeholder {
    line-height: 1.7;
  }
}

// 标签输入框样式
:deep(.van-field[name="tags"]) {
  .van-field__control {
    border-radius: 8px;
  }
}



// 难度选择器蒙层样式
.difficulty-picker-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 9999 !important;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  
  // 蒙层背景
  .overlay-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    animation: fadeIn 0.3s ease-out;
  }
  
  // 选择器容器
  .difficulty-selector {
    position: relative;
    background: white;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease-out;
    
    .selector-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
      
      .title {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
      }
      
      .cancel-btn, .confirm-btn {
        color: #1989fa;
        font-size: 14px;
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(25, 137, 250, 0.1);
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
    
    .selector-content {
      padding: 8px 0;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .difficulty-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: #f8f9fa;
      }
      
      &:active {
        transform: scale(0.98);
      }
      
      &.active {
        background: rgba(25, 137, 250, 0.1);
        
        .option-text {
          color: #1989fa;
          font-weight: 600;
        }
      }
      
      .option-text {
        font-size: 16px;
        color: #323233;
        transition: all 0.3s ease;
      }
      
      .option-check {
        color: #1989fa;
        font-size: 16px;
        animation: checkIn 0.3s ease-out;
      }
    }
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes checkIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}


.van-overlay {
  z-index: 1999 !important;
}

// 响应式设计
@media (max-width: 375px) {
  .unified-form {
    padding: 16px 12px;
  }
  
  .upload-field .custom-uploader .upload-area {
    padding: 30px 15px;
  }
  
  // 移动端日历优化
  .calendar-overlay {
    .calendar-container {
      border-radius: 16px 16px 0 0;
      
      :deep(.van-calendar) {
        border-radius: 16px 16px 0 0;
        
        .van-calendar__header {
          border-radius: 16px 16px 0 0;
        }
        
        .van-calendar__day {
          height: 40px !important;
          font-size: 14px;
        }
        
        .van-calendar__confirm {
          height: 44px;
          font-size: 15px;
          margin: 0 12px;
        }
      }
    }
  }
}

// 动画效果
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.unified-form {
  animation: slideInUp 0.6s ease-out;
}
</style>