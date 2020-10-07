import { Component, OnInit } from '@angular/core';
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
import { RestService } from './service/rest.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Hackathon';
  inputText: string;
  output: any;
  showResponse: boolean;
  validInput: boolean;
  selectedValue: string;
  convertFrom: string;
  convertTo: string;
  optionList = [
    {
      label: 'JSON Validator',
      value: 'validator'
    }, {
      label: 'JSON Formater',
      value: 'formater'
    },
    {
      label: 'Converter',
      value: 'converter'
    },
    {
      label: 'PDF Merger',
      value: 'merger'
    }
  ];
  convertTypes: [
    {
      label: 'Select',
      value: ''
    },
    {
      label: 'Excel',
      value: 'excel'
    },
    {
      label: 'JSON',
      value: 'json'
    },
    {
      label: 'XML',
      value: 'xml'
    },
    {
      label: 'PDF',
      value: 'pdf'
    },
    {
      label: 'Word',
      value: 'word'
    }
  ];
  totalLines: any = [];
  uploader: FileUploader;
  URL: string;
  issuccessMsg: boolean;
  successMsg: any;
  successsFlag: boolean;
  filename: any;
  fileList: FileItem[];
  uploadFileModel: string;
  uploadFileURL: string;
  pdfMergerList: any = [];
  invalidFile: boolean;
  pdfAlreadyExists: boolean;
  convertFileModel = '';
  convertFileName = '';
  convertModel = '';
  convertFileObj: {};
  outputPath = '';
  conversionSuccess: boolean;
  mergeSuccess: boolean;
  ngOnInit() {
    this.setUrl();
  }
  constructor(private restSer: RestService) {

  }

  validateInput(from) {
    if (from === 'button') {
      this.totalLines = [];
    }
    this.showResponse = true;
    const stringifiedData = JSON.stringify(this.inputText);
    console.log('after beautify', JSON.stringify(JSON.parse(this.inputText), undefined, '\t'));
    try {
      const lineCount = stringifiedData.split('\n');
      console.log('line count', lineCount.length);
      this.totalLines.push(lineCount);
      JSON.parse(this.inputText);
      this.output = 'Valid JSON';
      this.validInput = true;
    } catch (e) {
      this.output = e.message;
      const index = this.output.indexOf('position ');
      console.log('substring', this.output.substring(index + 9, this.output.length));
      console.log('err occurs at', this.inputText[+(this.output.substring(index + 9, this.output.length))]);
      console.log('err occurs stringifiedData', stringifiedData[+(this.output.substring(index + 9, this.output.length))]);
      this.validInput = false;
    }
  }
  clearInput() {
    this.inputText = '';
    this.showResponse = false;
  }
  selectOption(option) {
    this.inputText = '';
    this.convertFrom = '';
    this.convertTo = '';
    this.selectedValue = option;
    this.pdfMergerList = [];
    this.pdfAlreadyExists = false;
    this.invalidFile = false;
  }

  formatJson() {
    this.showResponse = true;
    try {
      // JSON.stringify(JSON.parse(this.inputText), undefined, '\t');
      this.inputText = JSON.stringify(JSON.parse(this.inputText), undefined, '\t');
      this.validInput = true;
    } catch (e) {
      this.output = e.message;
      this.validInput = false;
    }
  }

  changeFromTo() {
    this.convertFrom = this.convertModel.split('to')[0];
    this.convertTo = this.convertModel.split('to')[1];
    this.convertFileModel = '';
    this.convertFileObj = {};
    this.convertFileName = '';
    this.invalidFile = false;
  }

  setUrl() {
    this.uploader = new FileUploader({ url: this.URL });
    this.uploader.onErrorItem = (item, response, status, headers) => this.onErrorItem(item, response, status, headers);
    this.uploader.onSuccessItem = (item, response, status, headers) => this.onSuccessItem(item, response, status, headers);
  }

  onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    this.uploadFileURL = '';
  }

  onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    let getresponse: any;
    this.issuccessMsg = true;
    getresponse = JSON.parse(response);
    this.successMsg = getresponse.message;
    if (getresponse.status !== 'success') {
      this.successsFlag = false;
    } else {
      this.successsFlag = true;
    }
    this.uploadFileURL = '';
    // this.showImportPopup = false;
    this.uploader.uploadAll();
  }

  fileuploadFn(file: HTMLInputElement) {
    const splitted = (file.value).split('\\', 3);
    const filename = splitted[2];
    if (filename.indexOf('.pdf') > -1 || filename.indexOf('.PDF') > -1) {
      this.invalidFile = false;
      this.pdfAlreadyExists = false;
      if (this.pdfMergerList.length > 0) {
        for (const detail of this.pdfMergerList) {
          if (detail.filePath === file.value) {
            this.pdfAlreadyExists = true;
            break;
          }
        }
      }
      if (!this.pdfAlreadyExists) {
        const fileInfo = {
          filePath: 'D:\\' + filename,
          name: filename,
          password: ''
        };
        this.pdfMergerList.push(fileInfo);
      }
    } else {
      this.invalidFile = true;
    }
    this.convertFileModel = '';
  }

  removeItem(index) {
    this.pdfMergerList.splice(index, 1);
  }

  mergeFiles() {
    const pdfList1 = [];
    const passwordList1 = [];
    for (const pdf of this.pdfMergerList) {
      pdfList1.push(pdf.filePath);
      passwordList1.push(pdf.password);
    }
    this.restSer.post('ValidatorToolKit/rest/pdf/merge', { pdfList: pdfList1, passwordList: passwordList1 }).subscribe(
      data => {
        this.outputPath = '';
        const moduleData: any = data;
        if (moduleData !== 'fail') {
          this.outputPath = moduleData;
          this.pdfMergerList = [];
          this.mergeSuccess = true;
        } else {
          this.mergeSuccess = false;
        }
      }, error => {
      }
    );
  }

  convertfileuploadFn(file: HTMLInputElement, event) {
    const url = 'D:\\';

    const splitted = (file.value).split('\\', 3);
    const filename = splitted[2];
    if (filename.indexOf(this.convertFrom) > -1 || filename.indexOf(this.convertFrom.toUpperCase()) > -1) {
      this.invalidFile = false;
      this.convertFileName = filename;
      this.convertFileObj = {
        filePath: url + filename,
        name: filename
      };
    } else {
      this.invalidFile = true;
    }
    this.uploadFileModel = '';
  }


  convert() {
    const formData = new FormData();
    const fileItem = this.uploader.queue[0]._file;
    formData.append('file', fileItem);
    formData.append('fileSeq', 'seq' + 0);
    this.restSer.post('ValidatorToolKit/rest/conversion/' + this.convertModel, this.convertFileObj).subscribe(
      data => {
        this.outputPath = '';
        const moduleData: any = data;
        if (moduleData !== 'fail') {
          this.outputPath = moduleData;
          this.convertModel = '';
          this.conversionSuccess = true;
        } else {
          this.conversionSuccess = false;
        }
      }, error => {
      }
    );
  }

}
