import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Alert } from '../../../common/util/alert.util';
import { saveAs } from 'file-saver';
import { LineageEdge, SearchLineage } from '../../../domain/monitoring/lineage';
import { LineageService } from '../service/lineage.service';

@Component({
  selector: 'app-lineage-list',
  templateUrl: './lineage-list.component.html',
  styles: [
    '.sys-input-down-depth { float: left;position: relative; display: inline-block; width: 74%; margin-left: 8px; }',
    '.sys-icon-down { margin-top : 7px; }'
  ]
})
export class LineageListComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 선택 아이템
  @Input()
  public lineageEdges: LineageEdge[];

  @Input()
  public target: SearchLineage;

  // 변경 이벤트
  @Output() public onSelected = new EventEmitter();

  // 리스트 표시 전
  @Output() public beforeShowSelectedList = new EventEmitter();

  public downloadDepth: number = 9999;

  constructor(private lineageService: LineageService) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public download(downloadData, fileName) {
    if (!downloadData) {
      downloadData = this.lineageEdges;
    }
    var resultData = [];
    var keyList = ['depth', 'fromTable', 'fromColumn', 'sqlFile', 'workflowName', 'path', 'toTable', 'toColumn'];
    for (var inx = 0; inx < downloadData.length; inx++) {
      if (inx == 0) {
        resultData.push(keyList);
      }
      var ele = downloadData[inx];
      var valueList = [];
      for (var iny = 0; iny < keyList.length; iny++) {
        var value = ele[keyList[iny]];

        if (value && (iny == 3 || iny == 4 || iny == 5)) {
          value = this.sql_real_escape_string(value);
        }
        valueList[iny] = value ? '\"' + value + '\"' : '';
      }
      resultData.push(valueList);
    }
    var result = '';
    for (var inx = 0; inx < resultData.length; inx++) {
      result += resultData[inx] + '\r\n';
    }
    saveAs(new Blob([result], { type: 'application/csv' }), fileName);
  }

  public sql_real_escape_string(str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
      switch (char) {
        case '\0':
          return '\\0';
        case '\x08':
          return '\\b';
        case '\x09':
          return '\\t';
        case '\x1a':
          return '\\z';
        case '\n':
          return '\\n';
        case '\r':
          return '\\r';
        case '"':
        case '\'':
        case '\\':
        case '%':
          return '\\' + char;
      }
    });
  }

  public downloadAll() {
    const params = {};

    Object.assign(params, { depth: this.downloadDepth });

    if (this.target.type == 'TABLE' || this.target.type == 'COLUMN') {
      Object.assign(params, {
        databaseName: this.target.databaseName,
        tableName: this.target.tableName
      });
      this.lineageService.searchLineageDetailAll(params)
        .then((data) => {
          if (data) {
            this.download(data, 'lineage_data_all.csv');
          }
        }).catch((error) => {
        Alert.error(error.message.toString());
      });
    } else if (this.target.type == 'SQL') {
      if (this.lineageEdges && this.lineageEdges[0].toTable) {
        var schemaList = this.lineageEdges[0].toTable.split('.');
        Object.assign(params, {
          databaseName: schemaList.length > 1 ? schemaList[0] : '',
          tableName: schemaList.length > 1 ? schemaList[1] : schemaList[0]
        });
        this.lineageService.searchLineageDetailAll(params)
          .then((data) => {
            if (data) {
              this.download(data, 'lineage_data_all.csv');
            }
          }).catch((error) => {
          Alert.error(error.message.toString());
        });
      }
    }

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
