import {DIC} from './dict.js'

export const userOption = {
  border: true,
  index: true,
  height: 'auto',
  calcHeight: 320,
  indexLabel: '序号',
  selection: false,
  dicData: DIC,
  dic: ['GRADE', 'STATE'],
  formWidth: '60%',
  column: [{
    label: "用户名",
    prop: "username",
    width: "150",
    rules: [{
      required: true,
      message: "请输入用户名",
      trigger: "blur"
    }]
  },
    {
      label: "角色",
      prop: "role",
      type: "checkbox",
      dicData: 'GRADE'
    },
    {
      label: "创建时间",
      prop: "date",
      type: "datetime",
      format: "yyyy-MM-dd HH:mm:ss",
      valueFormat: "yyyy-MM-dd HH:mm:ss",
    },
    {
      label: "用户等级",
      prop: "level",
      type: "ueditor",
      hide: true,
      formHeight: 180,
      span: 24,
    },
    {
      label: "状态",
      prop: "state",
      solt: true,
      type: "radio",
      dicData: 'STATE'
    }
  ]
};
export const roleOption = {
  border: true,
  index: true,
  selection: false,
  calcHeight: 320,
  menuAlign: 'center',
  menuWidth: 300,
  column: [{
    label: "角色名称",
    prop: "name",
    width: "150",
    rules: [{
      required: true,
      message: "请输入用户名",
      trigger: "blur"
    }]
  },
    {
      label: "创建时间",
      prop: "date",
      format: "yyyy-MM-dd HH:mm:ss",
      valueFormat: "yyyy-MM-dd HH:mm:ss",
      type: "date",
    }
  ]
};
