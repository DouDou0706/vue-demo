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
    <div class="clearfix">
      <div class="pull-right m-t-5">
        <button 
          class="btn btn-default btn-sm" 
          :class="{ 'btn-primary': isLiked }"
          :disabled="!$root.userData"
          @click="handleLike">
          <i class="fa" :class="isLiked ? 'fa-heart' : 'fa-heart-o'"></i>
          <span class="badge">{{ msg.likeCount || 0 }}</span>
        </button>
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
    isLiked () {
      const { userData } = this.$root
      if (!userData || !this.msg.likedBy) return false
      return this.msg.likedBy.indexOf(userData.username) !== -1
    }
  },
  methods: {
    handleLike () {
      const { userData } = this.$root
      if (!userData) {
        $.toast({
          heading: '提示',
          text: '请先登录后再点赞',
          icon: 'info',
          stack: false
        })
        return
      }
      msgService.like(this.msg.id).then(updatedMsg => {
        this.msg = updatedMsg
      }).catch(err => {
        $.toast({
          heading: '操作失败',
          text: err.msg || '点赞失败，请重试',
          icon: 'error',
          stack: false
        })
      })
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
