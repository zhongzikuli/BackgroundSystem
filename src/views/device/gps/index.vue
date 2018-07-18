<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row>
        <el-col :span="8">
          <el-button @click="handleImport" type="primary" icon="el-icon-upload">
            导入
          </el-button>
          <el-button style="margin-left: 10px;" @click="handleDownload" type="primary" icon="el-icon-download">
            模板下载
          </el-button>
          <el-button style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-plus">
            新增
          </el-button>
          <el-button style="margin-left: 10px;" @click="handleDelete" type="primary" icon="el-icon-delete">
            删除
          </el-button>
        </el-col>
        <el-col :span="16">
          <el-form :inline="true">
            <el-button class="pull-right" style="margin-left: 10px;" type="primary">重置</el-button>
            <el-button class="pull-right" v-waves @click="handleSearch" type="primary">搜索</el-button>
            <el-form-item class="pull-right" style="margin-left: 10px;" label="状态：">
              <el-select value="区域一" placeholder="状态">
                <el-option label="区域一" value="shanghai"></el-option>
                <el-option label="区域二" value="beijing"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="pull-right" label="快捷搜索：">
              <el-input @keyup.enter.native="handleSearch" style="width: 300px;" placeholder="客户名、客户身份证号、IMEI"
                        v-model="listParams.username">
              </el-input>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>

    <el-table :key='tableKey' :data="deviceList" v-loading="listLoading" border fit
              highlight-current-row @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="36">
      </el-table-column>

      <el-table-column align="center" label="IMEI">
        <template slot-scope="scope">
          <span>{{scope.row.imei}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="SIM卡号码">
        <template slot-scope="scope">
          <span>{{scope.row.imei}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <el-tag>{{scope.row.status | statusFilter}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="车牌号">
        <template slot-scope="scope">
          <span>{{scope.row.plateNo}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="车架号">
        <template slot-scope="scope">
          <span>{{scope.row.vin}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="设备类型">
        <template slot-scope="scope">
          <span>{{scope.row.deviceTypeCode}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="设备型号">
        <template slot-scope="scope">
          <span>{{scope.row.deviceModelCode}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="客户名称">
        <template slot-scope="scope">
          <span>{{scope.row.customerName}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="身份证号码">
        <template slot-scope="scope">
          <span>{{scope.row.cardNo}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="客户手机">
        <template slot-scope="scope">
          <span>{{scope.row.tel}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="部门">
        <template slot-scope="scope">
          <span>{{scope.row.deptId}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="设备激活时间" prop="activeDate"
                       :formatter="formatterDate">
      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="卡激活时间" prop="simCardActiveDate"
                       :formatter="formatterDate">
      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="卡到期时间" prop="simCardExpireDate"
                       :formatter="formatterDate">
      </el-table-column>

      <el-table-column align="center" label="操作" width="180">
        <template slot-scope="scope">
          <el-button size="small" type="primary" @click="viewLocation(scope.row)">查看定位
          </el-button>
          <el-button size="small" type="success" @click="handleEdit(scope.row.id)">编辑
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <div v-show="!listLoading" class="pagination">
      <el-pagination @size-change="handleSizeChange" @current-change="handlePageChange"
                     :current-page.sync="listParams.page" :page-sizes="[10,20,30, 50]" :page-size="listParams.limit"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :model="deviceForm" :rules="rules" ref="deviceForm" label-width="100px">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span>客户信息</span>
          </div>
          <el-row>
            <el-col :span="12">
              <el-form-item label="客户名称" prop="">
                <el-input v-model="deviceForm.customerName" placeholder="请输入客户名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证号码" prop="">
                <el-input v-model="deviceForm.cardNo" placeholder="请输入身份证号码"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="客户手机" prop="">
                <el-input v-model="deviceForm.tel" placeholder="请输入客户手机"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门" prop="">
                <el-input v-model="deviceForm.deptId" placeholder="请输入部门"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车牌号" prop="">
                <el-input v-model="deviceForm.plateNo" placeholder="请输入车牌号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车架号" prop="">
                <el-input v-model="deviceForm.vin" placeholder="请输入车架号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车辆颜色" prop="">
                <el-input v-model="deviceForm.carColor" placeholder="请输入车辆颜色"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span>设备信息</span>
          </div>
          <el-row>
            <el-col :span="12">
              <el-form-item label="IMEI">
                <el-input v-model="deviceForm.imei" placeholder="请输入IMEI"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="密码" prop="">
                <el-input v-model="deviceForm.devicePassword" type="password" placeholder="请输入密码"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="确认密码" prop="">
                <el-input v-model="deviceForm.devicePasswordConfirm" type="password" placeholder="确认密码"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备类型" prop="">
                <el-input v-model="deviceForm.deviceTypeCode" placeholder="请输入设备类型"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备型号" prop="">
                <el-input v-model="deviceForm.deviceModelCode" placeholder="请输入设备型号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="激活时间" prop="">
                <el-date-picker
                  v-model="deviceForm.activeDate"
                  type="date"
                  placeholder="选择日期">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" v-if="dialogStatus == 'update'" prop="isEnabled">
                <el-select class="filter-item" v-model="deviceForm.status" placeholder="请选择">
                  <el-option v-for="item in statusOptions" :key="item" :label="item | statusFilter"
                             :value="item"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注" prop="">
                <el-input
                  type="textarea"
                  :rows="4"
                  placeholder="请输入内容"
                  v-model="deviceForm.remark">
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span>卡片名称</span>
          </div>
          <el-row>
            <el-col :span="12">
              <el-form-item label="SIM卡号码" prop="">
                <el-input v-model="deviceForm.simCardNo" placeholder="请输入SIM卡号码"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="卡激活时间" prop="">
                <el-date-picker
                  v-model="deviceForm.simCardActiveDate "
                  type="date"
                  placeholder="选择日期">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="卡到期时间" prop="">
                <el-date-picker
                  v-model="deviceForm.simCardExpireDate"
                  type="date"
                  placeholder="选择日期">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel('deviceForm')">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createEquipment('deviceForm')">添加</el-button>
        <el-button v-else type="primary" @click="updateEquipment('deviceForm')">修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {fetchList, getObj, putObj, delObj} from "@/api/user";
  import {fetchDeviceList, addDevice, editDevice, fetchSingleDevice, deleteDevice} from "@/api/device";
  import {validatenull} from "@/util/validate";
  import {deptRoleList, fetchDeptTree} from "@/api/role";
  import {formateDate} from "@/filters/index";
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
        deviceList: null,
        total: null,
        listLoading: true,
        listParams: {
          keyword: '',
          limit: 20,
          page: 1,
          status: ''
        },
        deviceForm: {
          customerName: '',
          cardNo: '',//身份证号
          tel: '',
          deptId: '',//部门
          plateNo: '',//车牌号
          vin: '',//车架号
          carColor: '',
          imei: '',
          devicePassword: '',
          devicePasswordConfirm: '',
          deviceTypeCode: '',//设备类型
          deviceModelCode: '',//设备型号
          activeDate: '',//激活时间
          remark: '',//备注
          simCardNo: '',//SIM卡号码
          simCardActiveDate: '',//卡激活时间
          simCardExpireDate: ''//卡到期时间
        },
        selectedDeviceIds: '',
        rules: {
          userName: [
            {
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
          ]
        },
        statusOptions: [0, 1],
        dialogFormVisible: false,
        dialogStatus: "",
        textMap: {
          update: "编辑设备",
          create: "添加设备"
        },
        isDisabled: {
          0: false,
          1: true
        },
        tableKey: 0
      };
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
      this.getDeviceList();
    },
    methods: {
      getDeviceList() {
        this.listLoading = true;
        fetchDeviceList(this.listParams).then(response => {
          this.deviceList = response.data.records;
          this.total = response.data.total;
          this.listLoading = false;
        });
      },
      handleSearch() {
        this.listParams.page = 1;
        this.getDeviceList();
      },
      handleSizeChange(val) {
        this.listParams.limit = val;
        this.getDeviceList();
      },
      handlePageChange(val) {
        this.listParams.page = val;
        this.getDeviceList();
      },
      handleImport() {

      },
      handleDownload() {

      },
      handleCreate() {
        this.dialogFormVisible = true;
        this.dialogStatus = "create";
        //this.deviceForm = {};
      },
      handleSelectionChange(val) {
        this.selectedDevice = val;
      },
      handleDelete() {
        if (validatenull(this.selectedDevice)) {
          this.$message({
            message: "请选择要删除的设备！",
            type: "warning",
            duration: 2000
          });
          return;
        }

        let selectedDeviceIds,
          selectedDeviceIdsArr = [],
          selectedDeviceName,
          selectedDeviceNameArr = [];
        this.selectedDevice.forEach(element => {
          selectedDeviceIdsArr.push(element.id);
          selectedDeviceNameArr.push(element.imei);
        });
        selectedDeviceIds = selectedDeviceIdsArr.join(',');
        selectedDeviceName = selectedDeviceNameArr.join(',');

        let para = {
          'ids': selectedDeviceIds
        };

        this.$confirm(
          "此操作将永久删除该设备(" + selectedDeviceName + "), 是否继续?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        ).then(() => {
          deleteDevice(selectedDeviceIds)
            .then(() => {
              this.getDeviceList();
              this.$message({
                message: "删除成功",
                type: "success",
                duration: 2000
              });
            })
            .catch(() => {
              this.$message({
                message: "删除失败",
                type: "error",
                duration: 2000
              });
            });
        });
      },
      viewLocation() {

      },
      handleEdit(id) {
        fetchSingleDevice(id).then(response => {
          this.deviceForm = response.data;
          this.dialogFormVisible = true;
          this.dialogStatus = "update";
        });
      },
      cancel(formName) {
        this.dialogFormVisible = false;
        this.$refs[formName].resetFields();
      },
      createEquipment(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            addDevice(this.deviceForm).then(() => {
              this.dialogFormVisible = false;
              this.getDeviceList();
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
      updateEquipment(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.dialogFormVisible = false;
            editDevice(this.deviceForm).then(() => {
              this.dialogFormVisible = false;
              this.getDeviceList();
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
      formatterDate(row, column) {
        return formateDate(new Date(row.simCardExpireDate)).substring(0, 10);
      }
    }
  };
</script>
