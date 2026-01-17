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
      <button class="btn btn-default" @click="toggleLike" :class="{ 'btn-danger': isLiked }" :disabled="!$root.userData">
        <i class="fa" :class="isLiked ? 'fa-heart' : 'fa-heart-o'"></i>
        <span class="m-l-5">{{ msg.likeCount || 0 }}</span>
      </button>
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
    isLiked () {
      return this.$root.userData && this.msg.likedBy && this.msg.likedBy.indexOf(this.$root.userData.username) !== -1
    }
  },
  events: {
    LIKE_UPDATED (payload) {
      if (payload.msgId === this.msg.id) {
        this.msg.likeCount = payload.likeCount
        if (payload.isLiked) {
          this.msg.likedBy = this.msg.likedBy || []
          if (this.msg.likedBy.indexOf(this.$root.userData.username) === -1) {
            this.msg.likedBy.push(this.$root.userData.username)
          }
        } else {
          const index = this.msg.likedBy.indexOf(this.$root.userData.username)
          if (index !== -1) {
            this.msg.likedBy.splice(index, 1)
          }
        }
      }
    }
  },
  methods: {
    toggleLike () {
      if (!this.$root.userData) return
      
      msgService.like(this.msg.id)
        .then((result) => {
          // 更新本地数据
          if (result && result.msg) {
            this.msg.likedBy = result.msg.likedBy
            this.msg.likeCount = result.msg.likeCount
            
            // 触发表单页更新
            this.$dispatch('LIKE_UPDATED', {
              msgId: this.msg.id,
              isLiked: result.isLiked,
              likeCount: result.likeCount
            })
          } else {
            // 重新获取留言数据
            msgService.fetchById(this.msg.id)
              .then((updatedMsg) => {
                this.msg.likedBy = updatedMsg.likedBy
                this.msg.likeCount = updatedMsg.likeCount
                
                this.$dispatch('LIKE_UPDATED', {
                  msgId: this.msg.id,
                  isLiked: this.isLiked,
                  likeCount: this.msg.likeCount
                })
              })
          }
        })
        .catch((err) => {
          if (err && err.errMsg) {
            alert(err.errMsg)
          }
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
