<template>
  <div class="clue-filter">
    <!-- 筛选按钮 -->
    <div class="filter-trigger" @click="showFilter = true">
      <van-icon name="filter-o" />
      <span>筛选</span>
      <van-badge v-if="activeFilterCount > 0" :content="activeFilterCount" />
    </div>

    <!-- 筛选弹窗 -->
    <van-popup
      v-model="showFilter"
      position="bottom"
      :style="{ height: '70%' }"
      round
      closeable
      close-icon-position="top-right"
    >
      <div class="filter-content">
        <div class="filter-header">
          <h3>筛选线索</h3>
        </div>

        <div class="filter-body">
          <!-- 难度级别 -->
          <div class="filter-section">
            <h4>难度级别</h4>
            <div class="filter-options">
              <van-tag
                v-for="difficulty in difficulties"
                :key="difficulty.value"
                :type="getDifficultyType(difficulty.value, filters.difficulty === difficulty.value)"
                @click="toggleFilter('difficulty', difficulty.value)"
              >
                {{ difficulty.label }}
              </van-tag>
            </div>
          </div>

          <!-- 排序方式 -->
          <div class="filter-section">
            <h4>排序方式</h4>
            <van-radio-group v-model="filters.sortBy">
              <van-radio
                v-for="sort in sortOptions"
                :key="sort.value"
                :name="sort.value"
              >
                {{ sort.label }}
              </van-radio>
            </van-radio-group>
          </div>
        </div>

        <div class="filter-footer">
          <van-button block @click="resetFilters">重置</van-button>
          <van-button type="primary" block @click="applyFilters">应用筛选</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
export default {
  name: 'ClueFilter',

  props: {
    categories: {
      type: Object,
      default: () => ({
        types: [],
        difficulties: [],
        popularTags: []
      })
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      showFilter: false,
      filters: {
        difficulty: null,
        sortBy: 'latest'
      },
      difficulties: [
        { value: 'EASY', label: '简单' },
        { value: 'MEDIUM', label: '中等' },
        { value: 'HARD', label: '困难' }
      ],
      sortOptions: [
        { value: 'latest', label: '最新发布' },
        { value: 'popular', label: '最受欢迎' }
      ]
    };
  },

  computed: {
    activeFilterCount() {
      let count = 0;
      if (this.filters.difficulty) count++;
      if (this.filters.sortBy !== 'latest') count++;
      return count;
    }
  },

  watch: {
    value: {
      handler(newValue) {
        this.filters = {
          difficulty: null,
          sortBy: 'latest',
          ...newValue
        };
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    toggleFilter(key, value) {
      if (this.filters[key] === value) {
        this.filters[key] = null;
      } else {
        this.filters[key] = value;
      }
    },



    getDifficultyType(difficulty, isSelected) {
      if (isSelected) return 'primary';
      
      const typeMap = {
        'EASY': 'success',
        'MEDIUM': 'warning',
        'HARD': 'danger'
      };
      return typeMap[difficulty] || 'default';
    },

    resetFilters() {
      this.filters = {
        difficulty: null,
        sortBy: 'latest'
      };
    },

    applyFilters() {
      const cleanFilters = {};
      Object.keys(this.filters).forEach(key => {
        const value = this.filters[key];
        if (value !== null && value !== undefined && value !== '' && 
            !(Array.isArray(value) && value.length === 0)) {
          cleanFilters[key] = value;
        }
      });

      this.$emit('input', cleanFilters);
      this.$emit('change', cleanFilters);
      this.showFilter = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.clue-filter {
  .filter-trigger {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background: #f7f8fa;
    border-radius: 16px;
    font-size: 14px;
    color: #646566;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      background: #ebedf0;
    }

    &:active {
      background: #dcdee0;
    }
  }
}

.filter-content {
  height: 100%;
  display: flex;
  flex-direction: column;

  .filter-header {
    padding: 20px 16px 0;
    border-bottom: 1px solid #f0f0f0;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #323233;
      margin: 0 0 16px;
      text-align: center;
    }
  }

  .filter-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;

    .filter-section {
      margin-bottom: 24px;

      h4 {
        font-size: 16px;
        font-weight: 500;
        color: #323233;
        margin: 0 0 12px;
      }

      .filter-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .van-tag {
          cursor: pointer;
          transition: all 0.3s ease;

          .tag-count {
            font-size: 11px;
            opacity: 0.7;
            margin-left: 4px;
          }

          &:hover {
            transform: translateY(-1px);
          }
        }
      }

      .van-radio-group {
        .van-radio {
          margin-bottom: 12px;
          width: 100%;
        }
      }
    }
  }

  .filter-footer {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    gap: 12px;

    .van-button {
      flex: 1;
    }
  }
}

@media (max-width: 480px) {
  .filter-content {
    .filter-body {
      padding: 12px;

      .filter-section {
        margin-bottom: 20px;
      }
    }

    .filter-footer {
      padding: 12px;
    }
  }
}
</style>