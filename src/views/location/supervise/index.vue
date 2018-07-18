<template>
  <div class="app-container">
    <el-row>
      <el-col :span="6" style='margin-top:15px;'>
        <el-input
          placeholder="请输入客户姓名、IMEI号码"
          v-model="filterText">
        </el-input>
        <el-tree
          ref="mapTree"
          class="filter-tree"
          :data="treeData"
          node-key="id"
          :props="defaultProps"
          :filter-node-method="filterNode"
          @node-click="getNodeData"
          @node-expand="getNodeDataExpand"
          :default-expand-all="defaultExpandAll"
          :highlight-current="highLightCurrent"
          :expand-on-click-node="false"
        >
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
  import {fetchDeptTree,getGpsServiceOnDept} from '@/api/location/supervise'

  export default {
    name: "locationSupervise",
    data() {
      return {
        mapObj: null,
        listQuery: {
          status: null
        },
        treeData: [],
        defaultProps: {
          children: 'children',
          label: 'name',
          isLeaf: 'isLeaf'
        },
        timer: null,
        fullHeight: document.documentElement.clientHeight - 180,
        defaultExpandAll: true,
        expandOnClickNode: false,
        highLightCurrent : true,
        filterText: ''
      }
    },
    methods: {
      getDeptTree() {
        fetchDeptTree(this.listQuery).then(response => {
          this.treeData = response.data;
        })
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      },
      getNodeDataExpand(data){
        let _self = this;
        getGpsServiceOnDept(data.id).then(response => {
          let rData = response.data;
          if (rData && rData.length > 0){
            //递归查找到children,然后设置数据
            _self.findAndSetChildren(data.id,rData,_self.treeData);
          }
        })
      },
      getNodeData(data,node) {
        let $node = node;
        if(data.isShow === 0){
          return;
        }
        if ($node.expanded) {
          $node.expanded = false;
          return;
        }

        let _self = this;
        getGpsServiceOnDept(data.id).then(response => {
          let rData = response.data;
          if (rData && rData.length > 0){
            //递归查找到children,然后设置数据
            _self.findAndSetChildren(data.id,rData,_self.treeData);
            return $node;
          }
        }).then($node=>{
          $node.expanded = true;
        })
      },
      findAndSetChildren(id,data,treeData) {
        const _id = id;
        const _data = data;
        const _treeData = treeData;
        for (let i = 0; i < _treeData.length; i ++){
          if (_treeData[i]['id'] === _id){
            if (_treeData[i]["children"] && _treeData[i]["children"].length > 0) {
              let _temChildren = _treeData[i]["children"];

                let flag = true;
                for (let k = 0; k < _data.length; k++){
                  for (let j = 0; j < _temChildren.length; j++){
                    if (_data[k]["id"] === _temChildren[j]["id"]){
                      _treeData[i]["children"].splice(j,1,_data[k]);
                      flag = false;
                      break;
                    }
                  }
                  if (flag) {
                    _treeData[i]["children"].push(_data[k]);
                    flag = true;
                  }
                }
            }else {
              _treeData[i]["children"] = _data;
            }
            return 0;
          }else {
             return this.findAndSetChildren(_id,_data,_treeData[i]["children"]);
          }
        }
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
      },
      filterText(val) {
        this.$refs.mapTree.filter(val);
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
  /*隐藏高德地图左下角的LOGO*/
  .amap-logo {
    display: none !important;
  }

  .amap-copyright {
    visibility: hidden !important;
  }
</style>
