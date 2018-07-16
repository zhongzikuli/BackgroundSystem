<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate"
                 type="primary">导出
      </el-button>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item"
                placeholder="快捷搜索"></el-input>
      <el-button class="filter-item" type="primary" v-waves icon="search" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" v-waves @click="resetFilter">重置</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit
              highlight-current-row style="width: 99%">
      <el-table-column align="center" label="IMEI">
        <template slot-scope="scope">
          <span>{{scope.row.imei}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="SIMI卡号码" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{scope.row.simiNumber}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="在线状态">
        <template slot-scope="scope">
          <span>{{scope.row.onlineStatu}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="设备类型">
        <template slot-scope="scope">
          <span>{{scope.row.deviceType}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="设备型号">
        <template slot-scope="scope">
          <el-tag>{{scope.row.deviceModel}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="客户名称">
        <template slot-scope="scope">
          <el-tag>{{scope.row.userName}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="身份证号码">
        <template slot-scope="scope">
          <el-tag>{{scope.row.userId}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="客户手机">
        <template slot-scope="scope">
          <el-tag>{{scope.row.userPhone}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="车牌号">
        <template slot-scope="scope">
          <el-tag>{{scope.row.carNumber}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="车架号">
        <template slot-scope="scope">
          <el-tag>{{scope.row.vinNumber}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="部门">
        <template slot-scope="scope">
          <el-tag>{{scope.row.userDept}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="最后定位时间">
        <template slot-scope="scope">
          <el-tag>{{scope.row.lastLocation}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="设备激活时间">
        <template slot-scope="scope">
          <el-tag>{{scope.row.deviceActive}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="卡激活时间">
        <template slot-scope="scope">
          <el-tag>{{scope.row.cardActive}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="卡到期时间">
        <template slot-scope="scope">
          <el-tag>{{scope.row.cardDeadline}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="small" type="success" @click="handleUpdate(scope.row)">查看定位</el-button>
        </template>
      </el-table-column>

    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogDeptVisible">
      <el-tree class="filter-tree" :data="treeDeptData" :default-checked-keys="checkedKeys" check-strictly node-key="id"
               highlight-current ref="deptTree" :props="defaultProps" @node-click="getNodeData" default-expand-all>
      </el-tree>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <div class="hidden">
          <el-input v-model="form.id"></el-input>
        </div>
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输用户名"></el-input>
        </el-form-item>

        <el-form-item v-if="dialogStatus == 'create'" label="密码" placeholder="请输入密码" prop="userPassword">
          <el-input type="password" v-model="form.userPassword"></el-input>
        </el-form-item>

        <el-form-item label="所属部门" prop="deptName">
          <el-input v-model="form.deptName" placeholder="选择部门" @focus="handleDept()" readonly></el-input>
          <input type="hidden" v-model="form.deptId"/>
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select class="filter-item" v-model="form.roleIds" multiple placeholder="请选择">
            <el-option v-for="item in rolesOptions" :key="item.id" :label="item.roleDesc" :value="item.id"
                       :disabled="isDisabled[item.isDeleted]">
              <span style="float: left">{{ item.roleDesc }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.roleCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="状态" v-if="dialogStatus == 'update' && sys_user_del " prop="isEnabled">
          <el-select class="filter-item" v-model="form.isEnabled" placeholder="请选择">
            <el-option v-for="item in statusOptions" :key="item" :label="item | statusFilter" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel('form')">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="create('form')">确 定</el-button>
        <el-button v-else type="primary" @click="update('form')">修 改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {fetchList, getObj, addObj, putObj, delObj} from "@/api/user";
  import {deptRoleList, fetchDeptTree} from "@/api/role";
  import waves from "@/directive/waves/index.js"; // 水波纹指令
  import {mapGetters} from "vuex";
  import ElRadioGroup from "element-ui/packages/radio/src/radio-group";
  import ElOption from "element-ui/packages/select/src/option";

  export default {
    components: {
      ElOption,
      ElRadioGroup
    },
    name: "table_user",
    directives: {
      waves
    },
    data() {
      return {
        treeDeptData: [],
        checkedKeys: [],
        defaultProps: {
          children: "children",
          label: "name"
        },
        list: null,
        total: null,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20
        },
        form: {
          id: undefined,
          userName: undefined,
          userPassword: undefined,
          deptId: undefined,
          roleIds: [],
          isEnabled: undefined
        },
        rules: {
          userName: [{
            required: true,
            message: "请输入账户",
            trigger: "blur"
          },
            {
              min: 3,
              max: 20,
              message: "长度在 3 到 20 个字符",
              trigger: "blur"
            }
          ],
          userPassword: [
            {
              required: true,
              message: "请输入密码",
              trigger: "blur"
            },
            {
              min: 5,
              max: 20,
              message: "长度在 5 到 20 个字符",
              trigger: "blur"
            }
          ],
          deptId: [
            {
              required: true,
              message: "请选择部门",
              trigger: "blur"
            }
          ],
          roleIds: [
            {
              required: true,
              message: "请选择角色",
              trigger: "blur"
            }
          ]
        },
        statusOptions: [0, 1],
        rolesOptions: [],
        dialogFormVisible: false,
        dialogDeptVisible: false,
        userAdd: false,
        userUpd: false,
        userDel: false,
        dialogStatus: "",
        textMap: {
          update: "编辑",
          create: "创建"
        },
        isDisabled: {
          0: false,
          1: true
        },
        tableKey: 0
      };
    },
    computed: {
      ...mapGetters(["permissions"])
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          0: "有效",
          1: "无效"
        };
        return statusMap[status];
      }
    },
    created() {
      this.getList();
      this.sys_user_add = this.permissions["sys_user_add"];
      this.sys_user_upd = this.permissions["sys_user_upd"];
      this.sys_user_del = this.permissions["sys_user_del"];
    },
    methods: {
      getList() {
        this.listLoading = true;
        this.listQuery.orderByField = "gmt_create";
        this.listQuery.isAsc = false;
        fetchList(this.listQuery).then(response => {
          this.list = response.data.records;
          this.total = response.data.total;
          this.listLoading = false;
        });
      },
      getNodeData(data) {
        this.dialogDeptVisible = false;
        this.form.deptId = data.id;
        this.form.deptName = data.name;
        deptRoleList(data.id).then(response => {
          this.rolesOptions = response.data;
        });
      },
      handleDept() {
        fetchDeptTree().then(response => {
          this.treeDeptData = response.data;
          this.dialogDeptVisible = true;
        });
      },
      handleFilter() {
        this.listQuery.page = 1;
        this.getList();
      },
      handleSizeChange(val) {
        this.listQuery.limit = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.page = val;
        this.getList();
      },
      handleCreate() {
        this.resetTemp();
        this.dialogStatus = "create";
        this.dialogFormVisible = true;
      },
      handleUpdate(row) {
        getObj(row.id).then(response => {
          this.form = response.data;
          this.dialogFormVisible = true;
          this.dialogStatus = "update";
          deptRoleList(response.data.deptId).then(response => {
            this.rolesOptions = response.data;
          });
        });
      },
      create(formName) {
        const set = this.$refs;
        this.form.role = this.role;
        set[formName].validate(valid => {
          if (valid) {
            addObj(this.form).then(() => {
              this.dialogFormVisible = false;
              this.getList();
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
            });
          } else {
            return false;
          }
        });
      },
      cancel(formName) {
        this.dialogFormVisible = false;
        this.$refs[formName].resetFields();
      },
      update(formName) {
        const set = this.$refs;
        set[formName].validate(valid => {
          if (valid) {
            this.dialogFormVisible = false;
            this.form.userPassword = undefined;
            putObj(this.form).then(() => {
              this.dialogFormVisible = false;
              this.getList();
              this.$notify({
                title: "成功",
                message: "修改成功",
                type: "success",
                duration: 2000
              });
            });
          } else {
            return false;
          }
        });
      },
      resetTemp() {
        this.form = {
          id: undefined,
          userName: "",
          userPassword: "",
          deptId: undefined,
          roleIds: [],
          isEnabled: undefined
        };
      }
    }
  };
</script>
