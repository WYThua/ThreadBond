<template>
  <div class="discover-page">
    <!-- 自定义导航栏 -->
    <div class="custom-nav-bar">
      <div class="nav-content">
        <h1 class="nav-title">发现线索</h1>
        <div class="nav-actions">
          <div class="search-btn" :class="{ active: isSearchMode }" @click="handleSearchBtnClick">
            <i class="fas fa-search"></i>
            <van-badge v-if="isSearchMode" dot />
          </div>
          <div class="filter-container">
            <div class="filter-btn" @click="toggleSortOptions">
              <i class="fas fa-sort"></i>
              <van-badge v-if="currentSort !== 'latest'" dot />
            </div>
            <!-- 排序选项下拉菜单 -->
            <div v-if="showSortOptions" class="sort-dropdown">
              <div 
                v-for="option in sortActions" 
                :key="option.value"
                class="sort-option"
                :class="{ active: currentSort === option.value }"
                @click="handleSortSelect(option)"
              >
                <span>{{ option.name }}</span>
                <i v-if="currentSort === option.value" class="fas fa-check"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 搜索栏 -->
      <div v-if="showSearchBar" class="search-bar">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索线索..."
          @search="handleSearch"
          @clear="handleClearSearch"
          @input="handleSearchInput"
          show-action
        >
          <template #action>
            <div @click="showSearchBar = false">取消</div>
          </template>
        </van-search>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="discover-content">
      <!-- 难度筛选 -->
      <div class="difficulty-filter">
        <div class="difficulty-container">
          <div class="difficulty-btn" @click="toggleDifficultyOptions">
            <i class="fas fa-filter"></i>
            <span>{{ getDifficultyText(currentDifficulty) }}</span>
            <van-badge v-if="currentDifficulty" dot />
          </div>
          <!-- 难度选项下拉菜单 -->
          <div v-if="showDifficultyOptions" class="difficulty-dropdown">
            <div 
              v-for="option in difficultyActions" 
              :key="option.value"
              class="difficulty-option"
              :class="{ active: currentDifficulty === option.value }"
              @click="handleDifficultySelect(option)"
            >
              <span>{{ option.name }}</span>
              <i v-if="currentDifficulty === option.value" class="fas fa-check"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 线索列表 -->
      <div class="clue-list">
        <!-- 加载状态 -->
        <div v-if="loading && clues.length === 0" class="loading-container">
          <van-loading size="24px" vertical>加载中...</van-loading>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading && clues.length === 0" class="empty-state">
          <van-empty description="暂无线索">
            <van-button type="primary" size="small" @click="refreshData">
              刷新试试
            </van-button>
          </van-empty>
        </div>

        <!-- 线索卡片列表 -->
        <div v-else class="clue-cards">
          <ClueCard
            v-for="clue in clues"
            :key="clue.id"
            :clue="clue"
            @click="handleClueClick"
          />
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more">
          <van-button
            v-if="!loadingMore"
            type="default"
            size="large"
            block
            @click="loadMore"
          >
            加载更多
          </van-button>
          <van-loading v-else size="24px" vertical>加载更多...</van-loading>
        </div>
      </div>
    </div>





    <!-- 返回顶部功能可以通过浏览器原生实现 -->
  </div>
</template>

<script>
import ClueCard from '@/components/clue/ClueCard.vue';
import clueApi from '@/api/clue';

export default {
  name: 'Discover',

  components: {
    ClueCard
  },

  data() {
    return {
      // UI 状态
      showSearchBar: false,
      showSortOptions: false,
      showDifficultyOptions: false,
      loading: false,
      loadingMore: false,
      
      // 搜索和筛选
      searchKeyword: '',
      currentSort: 'latest',
      currentDifficulty: null,
      
      // 数据
      clues: [],
      
      // 分页
      currentPage: 1,
      hasMore: true,
      
      // 防抖定时器
      searchDebounceTimer: null,
      
      // 选项数据
      sortActions: [
        { name: '最新发布', value: 'latest' },
        { name: '最受欢迎', value: 'popular' }
      ],
      difficultyActions: [
        { name: '全部难度', value: null },
        { name: '简单', value: 'EASY' },
        { name: '中等', value: 'MEDIUM' },
        { name: '困难', value: 'HARD' }
      ]
    };
  },

  computed: {
    isSearchMode() {
      return this.searchKeyword.trim().length > 0;
    }
  },

  async mounted() {
    console.log('🔍 发现页面已加载');
    await this.loadClues(true);
    
    // 添加点击外部关闭下拉菜单的事件监听
    document.addEventListener('click', this.handleClickOutside);
  },

  beforeDestroy() {
    // 移除事件监听
    document.removeEventListener('click', this.handleClickOutside);
    
    // 清理防抖定时器
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  },

  methods: {

    /**
     * 加载线索数据
     */
    async loadClues(reset = false) {
      if (reset) {
        this.currentPage = 1;
        this.clues = [];
        this.hasMore = true;
      }

      if (!this.hasMore && !reset) return;

      this.loading = reset;

      try {
        let response;
        const params = {
          page: this.currentPage,
          limit: 20,
          difficulty: this.currentDifficulty,
          sortBy: this.currentSort
        };

        console.log('加载线索参数:', params);

        if (this.isSearchMode) {
          // 搜索模式
          response = await clueApi.searchClues({
            q: this.searchKeyword,
            ...params
          });
        } else {
          // 根据排序方式加载数据
          if (this.currentSort === 'popular') {
            response = await clueApi.getTrendingClues(params);
          } else {
            response = await clueApi.getCluePool(params);
          }
        }

        console.log('API响应:', response);
        const { clues, hasMore } = response.data;

        if (reset) {
          this.clues = clues;
        } else {
          this.clues.push(...clues);
        }

        this.hasMore = hasMore;
        this.currentPage++;

      } catch (error) {
        console.error('加载线索失败:', error);
        this.$toast('加载线索失败');
      } finally {
        this.loading = false;
      }
    },

    /**
     * 加载更多
     */
    async loadMore() {
      if (this.loadingMore || !this.hasMore) return;
      
      this.loadingMore = true;
      try {
        await this.loadClues(false);
      } finally {
        this.loadingMore = false;
      }
    },

    /**
     * 切换排序选项显示
     */
    toggleSortOptions() {
      this.showSortOptions = !this.showSortOptions;
    },

    /**
     * 处理排序选择
     */
    async handleSortSelect(action) {
      this.currentSort = action.value;
      this.showSortOptions = false;
      await this.loadClues(true);
    },

    /**
     * 切换难度选项显示
     */
    toggleDifficultyOptions() {
      this.showDifficultyOptions = !this.showDifficultyOptions;
    },

    /**
     * 处理难度选择
     */
    async handleDifficultySelect(action) {
      console.log('选择难度:', action.value);
      this.currentDifficulty = action.value;
      this.showDifficultyOptions = false;
      await this.loadClues(true);
    },

    /**
     * 处理搜索按钮点击
     */
    handleSearchBtnClick() {
      if (this.searchKeyword.trim()) {
        // 如果已有搜索关键词，直接执行搜索
        this.handleSearch();
      } else {
        // 如果没有搜索关键词，显示/隐藏搜索栏
        this.showSearchBar = !this.showSearchBar;
        
        // 如果显示搜索栏，自动聚焦到输入框
        if (this.showSearchBar) {
          this.$nextTick(() => {
            const searchInput = document.querySelector('.van-search__field');
            if (searchInput) {
              searchInput.focus();
            }
          });
        }
      }
    },

    /**
     * 处理搜索输入（防抖）
     */
    handleSearchInput() {
      // 清除之前的定时器
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }
      
      // 如果搜索关键词为空，立即加载所有数据
      if (!this.searchKeyword.trim()) {
        this.loadClues(true);
        return;
      }
      
      // 设置防抖定时器，500ms后执行搜索
      this.searchDebounceTimer = setTimeout(() => {
        this.handleSearch();
      }, 500);
    },

    /**
     * 处理搜索
     */
    async handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.$toast('请输入搜索关键词');
        return;
      }
      
      await this.loadClues(true);
    },

    /**
     * 清除搜索
     */
    async handleClearSearch() {
      this.searchKeyword = '';
      await this.loadClues(true);
    },

    /**
     * 获取难度显示文本
     */
    getDifficultyText(difficulty) {
      const textMap = {
        'EASY': '简单',
        'MEDIUM': '中等',
        'HARD': '困难'
      };
      return difficulty ? textMap[difficulty] : '全部难度';
    },

    /**
     * 处理线索点击
     */
    handleClueClick(clue) {
      console.log('点击线索:', clue);
      // 跳转到线索详情页
      this.$router.push(`/clue/${clue.id}`);
    },

    /**
     * 处理点击外部区域
     */
    handleClickOutside(event) {
      const filterContainer = event.target.closest('.filter-container');
      const difficultyContainer = event.target.closest('.difficulty-container');
      
      if (!filterContainer && this.showSortOptions) {
        this.showSortOptions = false;
      }
      
      if (!difficultyContainer && this.showDifficultyOptions) {
        this.showDifficultyOptions = false;
      }
    },

    /**
     * 刷新数据
     */
    async refreshData() {
      await this.loadClues(true);
    }
  }
};
</script>

<style lang="scss" scoped>
.discover-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.custom-nav-bar {
  background: white;
  border-bottom: 1px solid #ebedf0;
  position: sticky;
  top: 0;
  z-index: 100;

  .nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;

    .nav-title {
      font-size: 18px;
      font-weight: 600;
      color: #323233;
      margin: 0;
    }

    .nav-actions {
      display: flex;
      gap: 12px;

      .search-btn {
        width: 36px;
        height: 36px;
        background: #f7f8fa;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;

        i {
          font-size: 16px;
          color: #646566;
        }

        &:hover {
          background: #ebedf0;
        }

        &:active {
          background: #dcdee0;
        }

        &.active {
          background: #e8f4ff;
          
          i {
            color: #1989fa;
          }
        }
      }

      .filter-container {
        position: relative;

        .filter-btn {
          width: 36px;
          height: 36px;
          background: #f7f8fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;

          i {
            font-size: 16px;
            color: #646566;
          }

          &:hover {
            background: #ebedf0;
          }

          &:active {
            background: #dcdee0;
          }
        }

        .sort-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #ebedf0;
          min-width: 120px;
          z-index: 1000;

          .sort-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            font-size: 14px;
            color: #323233;

            &:first-child {
              border-radius: 8px 8px 0 0;
            }

            &:last-child {
              border-radius: 0 0 8px 8px;
            }

            &:hover {
              background: #f7f8fa;
            }

            &.active {
              background: #e8f4ff;
              color: #1989fa;
            }

            i {
              font-size: 12px;
              color: #1989fa;
            }
          }
        }
      }
    }
  }

  .search-bar {
    padding: 0 16px 12px;
  }
}

.discover-content {
  .difficulty-filter {
    background: white;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

    .difficulty-container {
      position: relative;
      display: inline-block;

      .difficulty-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: #f7f8fa;
        border-radius: 16px;
        font-size: 14px;
        color: #646566;
        cursor: pointer;
        transition: all 0.3s ease;

        i {
          font-size: 14px;
          color: #646566;
        }

        &:hover {
          background: #ebedf0;
        }

        &:active {
          background: #dcdee0;
        }
      }

      .difficulty-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 8px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: 1px solid #ebedf0;
        min-width: 120px;
        z-index: 1000;

        .difficulty-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          font-size: 14px;
          color: #323233;

          &:first-child {
            border-radius: 8px 8px 0 0;
          }

          &:last-child {
            border-radius: 0 0 8px 8px;
          }

          &:hover {
            background: #f7f8fa;
          }

          &.active {
            background: #e8f4ff;
            color: #1989fa;
          }

          i {
            font-size: 12px;
            color: #1989fa;
          }
        }
      }
    }
  }

  .clue-list {
    padding: 16px;

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px 0;
    }

    .empty-state {
      padding: 40px 20px;
    }

    .clue-cards {
      .clue-card {
        margin-bottom: 12px;
      }
    }

    .load-more {
      margin-top: 20px;
      text-align: center;
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .custom-nav-bar {
    .nav-content {
      padding: 10px 12px;

      .nav-title {
        font-size: 16px;
      }
    }

    .search-bar {
      padding: 0 12px 10px;
    }
  }

  .discover-content {
    .difficulty-filter {
      padding: 10px 12px;
    }

    .clue-list {
      padding: 12px;
    }
  }
}
</style>