<template>
  <div class="panel panel-default">
    <div class="panel-heading clearfix">
      标题：<strong>{{ msg.title }}</strong>
      <span class="badge pull-right">
        {{ msg.ctime | dateTimeFormatter }}
      </span>
      <br>
      发布者：
      <a v-link="`/msg?authors=${msg.author}`">
        {{ msg.author }}
      </a>
    </div>
    <div class="panel-body min-h-160 max-h-300 overflow-fix">
      <p class="lead">{{ msg.content }}</p>
    </div>
    <div class="panel-footer clearfix">
      <div class="pull-left">
        <button 
          v-if="$root.userData"
          @click="handleLike"
          :class="['btn', 'btn-sm', getLikeButtonClass()]">
          <i :class="['fa', hasLiked ? 'fa-heart' : 'fa-heart-o']"></i>
          {{ msg.likeCount || 0 }}
        </button>
        <span v-else class="text-muted">
          <i class="fa fa-heart-o"></i>
          {{ msg.likeCount || 0 }}
        </span>
      </div>
      <div class="pull-right m-t-5">
        <opt-btn-group
          :msg="msg" :auto-jump="true">
        </opt-btn-group>
      </div>
    </div>
  </div>
</template>
<script>
import OptBtnGroup from './_components/OptBtnGroup'
import autoLoadByParams from './_mixins/autoLoadByParams'
import msgService from '@/services/msgService'

export default {
  mixins: [autoLoadByParams],
  components: { OptBtnGroup },
  data: () => ({ msg: {} }),
  computed: {
    isMine () {
      const { author } = this.msg
      const { userData } = this.$root
      if (!author || !userData) return
      return author === userData.username
    },
    hasLiked () {
      return this.msg.likedBy && this.$root.userData && 
             this.msg.likedBy.indexOf(this.$root.userData.username) !== -1
    }
  },
  methods: {
    handleLike () {
      msgService.toggleLike(this.msg.id)
        .then(({ likeCount, likedBy }) => {
          this.msg.likeCount = likeCount
          this.msg.likedBy = likedBy
          this.$dispatch('LIKE_UPDATED', { 
            id: this.msg.id, 
            likeCount,
            likedBy 
          })
        })
        .catch(err => {
          console.error('点赞失败:', err)
        })
    },
    getLikeButtonClass () {
      return this.hasLiked ? 'btn-danger' : 'btn-default'
    }
  }
}
</script>
<style>
.min-h-160 {
  min-height: 160px;
}
.max-h-300 {
  max-height: 300px;
}
.overflow-fix {
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
