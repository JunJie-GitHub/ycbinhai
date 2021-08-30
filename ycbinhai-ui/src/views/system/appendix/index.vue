<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文件名" prop="appendixDesc">
        <el-input
          v-model="queryParams.appendixDesc"
          placeholder="请输入文件名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="删除" prop="delFlag">
        <el-select v-model="queryParams.delFlag" placeholder="请选择删除" clearable size="small">
          <el-option
            v-for="dict in delFlagOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-upload
          :limit="1"
          ref="upload"
          :action="upload.url"
          :headers="upload.headers"
          :disabled="upload.isUploading"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          v-hasPermi="['system:appendix:add']"
        >上传</el-button>
        </el-upload>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:appendix:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:appendix:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
		  :loading="exportLoading"
          @click="handleExport"
          v-hasPermi="['system:appendix:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="appendixList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文件名" prop="appendixDesc" />
      <el-table-column label="大小(KB)" align="center" width="100" prop="appendixSize" />
      <el-table-column label="路径"  width="500" prop="appendixPath" />
      <el-table-column label="上传时间" align="center" width="160" prop="createTime" />
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="scope">

          <el-button
            v-if="checkSuffix(scope.row.appendixSuffix)"
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="onPreview(scope.row.appendixPath)"
            v-hasPermi="['system:appendix:edit']"
          >预览</el-button>

          <el-button
            v-if="!checkSuffix(scope.row.appendixSuffix)"
            size="mini"
            type="text"
            icon="el-icon-download"
            @click="handleDownload(scope.row)"
            v-hasPermi="['system:appendix:edit']"
          >下载</el-button>

          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:appendix:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:appendix:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改附件对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文件名" prop="appendixDesc">
          <el-input v-model="form.appendixDesc" placeholder="请输入文件名" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-image-viewer
      v-if="showViewer"
      :on-close="closeViewer"
      :url-list="[imageViewUrl]" />
  </div>
</template>

<script>
import {
  addAppendix,
  delAppendix,
  exportAppendix,
  getAppendix,
  listAppendix,
  updateAppendix
} from "@/api/system/appendix";
import {getToken} from "@/utils/auth";
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'

export default {
  name: "Appendix",
  components: { ElImageViewer },
  data() {
    return {
      showViewer: false, // 显示查看器
      imageViewUrl:null,
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 附件表格数据
      appendixList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 删除字典
      delFlagOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appendixDesc: null,
        delFlag: null,
      },
      // 用户导入参数
      upload: {
        // 是否禁用上传
        isUploading: false,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/common/uploadFile"
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_del_flag").then(response => {
      this.delFlagOptions = response.data;
    });
  },
  methods: {
    // 文件下载处理
    handleDownload(row) {
      var name = row.appendixDesc;
      var url = process.env.VUE_APP_BASE_API + row.appendixPath;
      const a = document.createElement('a')
      a.setAttribute('download', name)
      a.setAttribute('target', '_blank')
      a.setAttribute('href', url)
      a.click()
    },
    //判断文件类型是否是图片
    checkSuffix(suffix){
      let suffixArray = ".jpg|.gif|.png|.jpeg|.bmp"
      return suffixArray.indexOf(suffix)>=0;
    },
    // 打开查看器
    onPreview(img) {
      this.showViewer = true;
      this.imageViewUrl= process.env.VUE_APP_BASE_API+img;
    },
    // 关闭查看器
    closeViewer() {
      this.showViewer = false
    },
    /** 查询附件列表 */
    getList() {
      this.loading = true;
      listAppendix(this.queryParams).then(response => {
        this.appendixList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 删除字典翻译
    delFlagFormat(row, column) {
      return this.selectDictLabel(this.delFlagOptions, row.delFlag);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        appendixId: null,
        appendixDesc: null,
        appendixName: null,
        appendixSuffix: null,
        appendixSize: null,
        appendixPath: null,
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.appendixId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.msgSuccess("上传成功！");
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const appendixId = row.appendixId || this.ids
      getAppendix(appendixId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改附件";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.appendixId != null) {
            updateAppendix(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addAppendix(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const appendixIds = row.appendixId || this.ids;
      this.$confirm('是否确认删除附件编号为"' + appendixIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delAppendix(appendixIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有附件数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          this.exportLoading = true;
          return exportAppendix(queryParams);
        }).then(response => {
          this.download(response.msg);
          this.exportLoading = false;
        }).catch(() => {});
    }
  }
};
</script>
