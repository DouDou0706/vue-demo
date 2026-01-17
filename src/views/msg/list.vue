<template>
  <div>
    <div class="row">
      <div class="col-sm-6 col-md-5 col-lg-4">
        <author-select></author-select>
      </div>
      <div v-if="$root.userData" class="col-sm-6 col-md-7 col-lg-8 clearfix">
        <a v-link="`/msg/add`" class="btn btn-default btn-sm pull-right">
          <span class="fa-stack m-r-5">
            <i class="fa fa-comment-o fa-stack-2x"></i>
            <i class="fa fa-plus fa-stack-1x"></i>
          </span>
          添加留言信息
        </a>
      </div>
    </div>
    
    <div class="row min-h-180">
      <div class="col-sm-12">
        <ul class="list-group m-t-5">
          <li v-for="msg in msgs" class="list-group-item clearfix" track-by="id">
            <h4 class="list-group-item-heading">
              <a v-link="`/msg/detail/${msg.id}`">
                {{ msg.title | cutLongText }}
              </a>
              <small class="italic"> by
                <a v-link="{ path: '/msg', query: { authors: msg.author } }">
                  {{ msg.author }}
                </a>
              </small>
              <span class="badge pull-right">
                {{ msg.ctime | dateTimeFormatter }}
              </span>
            </h4>
            <small class="list-group-item-text">
              {{ msg.content | cutLongText 20 }}
            </small>
            <div class="pull-right btn-group-xs">
              <button 
                class="btn btn-default" 
                :class="{ 'btn-primary': isLiked(msg) }"
                :disabled="!$root.userData"
                @click.stop="handleLike(msg)">
                <i class="fa" :class="isLiked(msg) ? 'fa-heart' : 'fa-heart-o'"></i>
                <span class="badge">{{ msg.likeCount || 0 }}</span>
              </button>
              <opt-btn-group class="btn-group" :msg="msg">
                <a v-link="`/msg/detail/${msg.id}`" class="btn btn-default">
                  <i class="fa fa-search-plus"></i>
                </a>
              </opt-btn-group>
            </div>
          </li>
        </ul>

        <h4 v-show="!total" class="text-muted text-center line-h-150 italic">
          （暂无留言信息）
        </h4>
      </div>
    </div>
    
    <div class="row">
      <div class="col-sm-6 nowrap">
        共 <span class="badge">{{ total }}</span> 条记录，
        <limit-select></limit-select>
      </div>
      <div class="col-sm-6 clearfix">
        <pagination :total="total" class="pull-right"></pagination>
      </div>
    </div>
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import LimitSelect from '@/components/Select/LimitSelect'
import AuthorSelect from './_components/AuthorSelect'
import OptBtnGroup from './_components/OptBtnGroup'
import updateQuery from '@/mixins/updateQuery'
import msgService from '@/services/msgService'

export default {
  mixins: [updateQuery],
  components: { Pagination, LimitSelect, AuthorSelect, OptBtnGroup },
  data: () => ({ total: 0, msgs: [] }),
  route: {
    data () {
      msgService
        .fetchList(this.$route.query)
        .then(({ total, rows }) => {
          this.total = total
          this.msgs = rows
        })
    }
  },
  methods: {
    isLiked (msg) {
      const { userData } = this.$root
      if (!userData || !msg.likedBy) return false
      return msg.likedBy.indexOf(userData.username) !== -1
    },
    handleLike (msg) {
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
      console.log('点赞请求:', msg.id, userData.username)
      msgService.like(msg.id).then(updatedMsg => {
        console.log('点赞成功:', updatedMsg)
        const index = this.msgs.findIndex(m => m.id === msg.id)
        if (index !== -1) {
          this.$set(this.msgs, index, updatedMsg)
        }
      }).catch(err => {
        console.error('点赞失败:', err)
        $.toast({
          heading: '操作失败',
          text: err.msg || '点赞失败，请重试',
          icon: 'error',
          stack: false
        })
      })
    }
  },
  filters: {
    cutLongText (txt, limit = 10) {
      return txt.length > limit
        ? txt.substr(0, limit) + '···'
        : txt
    }
  },
  events: {
    REFETCH_LIST () {
      this.updateQuery({ _: Date.now() })
    }
  }
}
</script>
<style>
.min-h-180 {
  min-height: 180px;
}
.line-h-150 {
  line-height: 150px;
}
.italic {
  font-style: italic;
}
.nowrap {
  white-space: nowrap;
}
</style>
