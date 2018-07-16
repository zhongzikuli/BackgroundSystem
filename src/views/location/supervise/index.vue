<template>
  <div class="app-container calendar-list-container">
    <el-row>
      <el-col :span="6" style='margin-top:15px;'>
        <el-tree
          class="filter-tree"
          :data="treeData"
          node-key="id"
          highlight-current
          :props="defaultProps"
          :filter-node-method="filterNode"
          @node-click="getNodeData"
          @node-expand="getNodeData"
          :default-expand-all="defaultExpandAll"
          :highlight-current="highLightCurrent"
        >
          <span slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
              <span>
                ({{data.normalGpsNum}}/{{data.dropsGpsNum}})
              </span>
          </span>
        </el-tree>
      </el-col>
      <el-col :span="18">
        <div id="mapContainer" :style="{height:fullHeight + 'px'}"></div>
      </el-col>
    </el-row>

  </div>
</template>

<script>
  import AMap from 'AMap'
  import {fetchDeptTree} from '@/api/location/supervise'

  export default {
    name: "locationSupervise",
    data() {
      return {
        mapObj: null,
        listQuery: {
          searchKey: undefined
        },
        treeData: [],
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        timer: null,
        fullHeight: document.documentElement.clientHeight - 180,
        defaultExpandAll: false,
        expandOnClickNode: false,
        highLightCurrent : true
      }
    },
    methods: {
      getDeptTree() {
        fetchDeptTree(this.listQuery).then(response => {
          this.treeData = response.data;
        })
      },
      filterNode(value, data) {

      },
      getNodeData(data) {
        console.log(data.id)
      }
    },
    created() {
      this.getDeptTree();
    },
    mounted() {
      let _self = this;
      this.mapObj = new AMap.Map('mapContainer', {
        resizeEnable: true,
        view: new AMap.View2D({
          resizeEnable: true,
          zoom: 12
        }),
        // mapStyle: 'amap://styles/whitesmoke', //设置地图的显示样式
        keyboardEnable: false
      });
      AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView', 'AMap.MouseTool'], function () {
        _self.mapObj.addControl(new AMap.ToolBar());
        _self.mapObj.addControl(new AMap.Scale());
        _self.mapObj.addControl(new AMap.OverView({isOpen: true}));
        _self.mouseTool = new AMap.MouseTool(_self.mapObj);
        _self.mapObj.addControl(_self.mouseTool)
      });

      window.onresize = () => {
        return (() => {
          _self.fullHeight = document.documentElement.clientHeight - 180;
        })()
      }
    },
    watch: {
      fullHeight(val) {
        if (!this.timer) {
          this.fullHeight = val;
          this.timer = true;
          let that = this;
          setTimeout(function () {
            that.timer = false;
          }, 400)
        }
      }
    },
    activated() {
      //keep-alive 激活的时候触发
    },
    deactivated() {
      //失活的时候触发
      // 清理地图之前的标记
      this.mapObj.clearMap()
    }
  }
</script>

<style lang="scss">
  #mapContainer {
    min-height: 400px;
  }

  .amap-logo {
    display: none !important;
  }

  .amap-copyright {
    visibility: hidden !important;
  }
</style>
