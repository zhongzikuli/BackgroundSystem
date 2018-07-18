<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row>
        <el-col :span="8">
          <el-button @click="handleExport" type="primary" icon="el-icon-upload">导出</el-button>
        </el-col>
        <el-col :span="16">
          <el-form :inline="true">
            <el-button class="pull-right" style="margin-left: 10px;" type="primary">重置</el-button>
            <el-button class="pull-right" v-waves @click="handleSearch" type="primary">搜索</el-button>

            <el-form-item class="pull-right" label="快捷搜索：">
              <el-input @keyup.enter.native="handleSearch" style="width: 300px;" placeholder="客户名、客户身份证号、IMEI"
                        v-model="listParams.username">
              </el-input>
            </el-form-item>
            <el-form-item class="pull-right" style="margin-left: 10px;" label="状态：">
              <el-select v-model="listParams.devicestatus" placeholder="状态">
                <el-option label="正常" value="1"></el-option>
                <el-option label="异常" value="2"></el-option>
                <el-option label="拆除" value="3"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>

    <el-table :key='tableKey' :data="deviceList" v-loading="listLoading" border fit highlight-current-row
              @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="36"></el-table-column>
      <el-table-column align="center" label="IMEI">
        <template slot-scope="scope">
          <span>{{scope.row.imei}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="SIM卡号码">
        <template slot-scope="scope">
          <span>{{scope.row.sim}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="在线状态">
        <template slot-scope="scope">
          <el-tag>{{scope.row.status | statusFilter}}</el-tag>
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

      <el-table-column align="center" class-name="status-col" label="部门">
        <template slot-scope="scope">
          <span>{{scope.row.deptId}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="status-col" label="最后定位时间" prop="lastLocationDate"
                       :formatter="formatterDate">
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
          <el-button size="small" type="primary" @click="viewLocation(scope.row)">查看定位</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination">
      <el-pagination @size-change="handleSizeChange" @current-change="handlePageChange"
                     :current-page.sync="listParams.page" :page-sizes="[10,20,30, 50]" :page-size="listParams.limit"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import {fetchDeviceList} from "@/api/device";
  import {formateDate} from "@/filters";
  import waves from "@/directive/waves"; // 水波纹指令
  import ElRadioGroup from "element-ui/packages/radio/src/radio-group";
  import ElOption from "element-ui/packages/select/src/option";

  export default {
    components: {
      ElOption,
      ElRadioGroup
    },
    name: "device-count",
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
          username: '',
          devicestatus: ''
        },
        selectedDeviceIds: '',
        tableKey: 0
      }
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
      handleExport() {

      },
      handleSelectionChange(val) {
        this.selectedDevice = val;
      },
      viewLocation() {

      },
      formatterDate(row, column) {
        return formateDate(new Date(row.simCardExpireDate)).substring(0, 10);
      }
    }
  };
</script>
