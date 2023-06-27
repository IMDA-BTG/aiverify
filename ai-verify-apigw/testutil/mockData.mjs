import { jest } from '@jest/globals';
import casual from 'casual';
import mongoose from 'mongoose';

casual.define('ObjectId', function() {
  return mongoose.Types.ObjectId().toString();
})

casual.define('randomString', function(len) {
  if (typeof len !== 'number') {
    len = 128; // default 128;
  }
  let str = "";
  for (let i=0; i<len; i++) {
    str += casual.letter;
  }
  return str;
})

casual.define('algorithm', function() {
  const results = casual.array_of_words(10);
  return {
    data: {
      results
    },
    inputSchema: {
      "type": "object",
      "required": [
        "arg1"
      ],
      "properties": {
        "arg1": {
          "type": "string",
          "title": "Argument 1"
        },
        "arg2": {
          "type": "string",
          "title": "Argument 2"
        }
      }
    },
    outputSchema: {
      "type": "object",
      "required": [
        "results"
      ],
      "properties": {
        "results": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
  }
})

casual.define('projectGlobalVars', function(count) {
  if (typeof count !== 'number') {
    count=1;
  }
  let ar = [];
  for (let i=0; i<count; i++) {
    ar.push({
      key: casual.word,
      value: casual.word,
    })
  }
  return ar;
})

casual.define('reportPages', function(count) {
  if (typeof count !== 'number') {
    count=1;
  }
  let ar = [];
  for (let i=0; i<count; i++) {
    ar.push({
      layouts: [{
        "w": casual.integer(1,12),
        "h": casual.integer(1,36),
        "x": casual.integer(1,12),
        "y": casual.integer(1,36),
        "i": casual.randomString(15),
        "minW": casual.integer(1,12),
        "maxW": casual.integer(1,12),
        "minH": casual.integer(1,36),
        "maxH": casual.integer(1,36),
        "static": false
      }],
      reportWidgets: [
        {
          "widgetGID": "aiverify.tests:testchart",
          "key": "1679406557587",
          "layoutItemProperties": {
            "justifyContent": casual.random_element(['left', 'center', 'right']),
            "alignItems": casual.random_element(['top', 'center', 'bottom']),
            "color": casual.rgb_hex,
            "bgcolor": casual.rgb_hex
          },
          "properties": {
            [casual.word]: casual.word
          }
        },
      ]
    })
  }
  return ar;
})

casual.define('projectTemplate', function() {
  const globalVars = casual.projectGlobalVars(1);
  const pages = casual.reportPages(1);
  return {
    fromPlugin: false,
    projectInfo: {
      name: casual.full_name,
      description: casual.short_description,
      reportTitle: casual.title,
      company: casual.company_name,
    },
    globalVars,
    pages,
  }
})

casual.define('multipleProjectTemplates', function(count) {
  if (typeof count !== 'number') {
    count=2;
  }
  let ar = [];
  for (let i=0; i<count; i++) {
    ar.push(casual.projectTemplate)
  }
  return ar;
})

casual.define('testInformation', function(count) {
  if (typeof count !== 'number') {
    count=2;
  }
  let ar = [];
  for (let i=0; i<count; i++) {
    ar.push({
      algorithmGID: casual.uuid,
      // isTestArgumentsValid: true,
      testArguments: {
        "arg1": "value1",
        "arg2": "value2",
      }
    })
  }
  return ar;
})

casual.define('project', function() {
  const template = casual.projectTemplate;
  delete template.fromPlugin;
  return {
    ...template,
    inputBlockData: {},
    testInformationData: casual.testInformation(1)
  }
})

casual.define('multipleProjects', function(count) {
  if (typeof count !== 'number') {
    count=2;
  }
  let ar = [];
  for (let i=0; i<count; i++) {
    ar.push(casual.project)
  }
  return ar;
})

// report status: ["NoReport","RunningTests","GeneratingReport","ReportGenerated","ReportError"]
casual.define('report', function(project, status) {
  let tests = [];
  for (let test of project.testInformationData) {
    // let status = casual.random_element(["Pending", "Running", "Cancelled", "Success", "Error" ])
    let obj = {
      algorithmGID: test.algorithmGID,
      testArguments: test.testArguments,
      status: "Pending",
    }
    // if (status === "Success") {
    //   const timeTaken = casual.integer;
    //   totalTestTimeTaken += timeTaken;
    //   obj = {
    //     ...obj,
    //     progress: 100,
    //     timeStart: casual.moment.toDate(),
    //     timeTaken,
    //     output: {},
    //   }
    // }
    tests.push(obj); 
  }
  let report = {
    project: project._id,
    status,
    tests,
  }
  if (report.status === "ReportGenerated") {
    let totalTestTimeTaken = 0;
    report = {
      ...report,
      timeStart: casual.moment.toDate(),
      timeTaken: totalTestTimeTaken + casual.integer,
      totalTestTimeTaken,
      inputBlockData: project.inputBlockData,
      tests,
    }
  }
  return report;
})

const mockModel = {
  filename: 'pickle_scikit_bc_compas.sav',
  name: 'pickle_scikit_bc_compas.sav',
  filePath: '/home/test/uploads/model/pickle_scikit_bc_compas.sav',
  ctime: new Date('2023-06-05T07:17:25.132Z'),
  description: '',
  status: 'Valid',
  size: '502.71 KB',
  modelType: 'Classification',
  serializer: 'pickle',
  modelFormat: 'sklearn',
  errorMessages: '',
  type: 'File',
  createdAt: new Date('2023-06-05T07:17:25.140Z'),
  updatedAt: new Date('2023-06-05T07:17:26.151Z')
}

const mockTestDataset = {
    filename: 'pickle_pandas_tabular_compas_testing.sav',
    name: 'pickle_pandas_tabular_compas_testing.sav',
    type: 'File',
    filePath: '/home/test/uploads/data/pickle_pandas_tabular_compas_testing.sav',
    ctime: '2023-06-05T07:17:06.360Z',
    description: '',
    status: 'Valid',
    size: '68.33 KB',
    serializer: 'pickle',
    dataFormat: 'pandas',
    errorMessages: '',
    dataColumns: [
        {
            name: 'age_cat_cat',
            datatype: 'int64',
            label: 'age_cat_cat',
            _id: mongoose.Types.ObjectId('647d8bf3ef104c4da904734a')
        },
        {
            name: 'sex_code',
            datatype: 'int64',
            label: 'sex_code',
            _id: mongoose.Types.ObjectId('647d8bf3ef104c4da904734b')
        },
        {
            name: 'race_code',
            datatype: 'int64',
            label: 'race_code',
            _id: mongoose.Types.ObjectId('647d8bf3ef104c4da904734c')
        },
        {
            name: 'priors_count',
            datatype: 'int64',
            label: 'priors_count',
            _id: mongoose.Types.ObjectId('647d8bf3ef104c4da904734d')
        },
        {
            name: 'c_charge_degree_cat',
            datatype: 'int64',
            label: 'c_charge_degree_cat',
            _id: mongoose.Types.ObjectId('647d8bf3ef104c4da904734e')
        },
        {
            name: 'two_year_recid',
            datatype: 'int64',
            label: 'two_year_recid',
            _id: mongoose.Types.ObjectId('647d8bf3ef104c4da904734f')
        }
    ],
    createdAt: new Date('2023-06-05T07:17:06.368Z'),
    updatedAt: new Date('2023-06-05T07:17:07.385Z'),
    __v: 0,
    numCols: 6,
    numRows: 1235
};
export default casual;
export {mockModel, mockTestDataset};