import { Component, ElementRef, Injector, Input, OnInit, ViewChild, NgZone } from '@angular/core';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { PopupService } from '../../../common/service/popup.service';
import { LineageService } from '../service/lineage.service';
import { Alert } from '../../../common/util/alert.util';
import { DeleteModalComponent } from '../../../common/component/modal/delete/delete.component';
import { LineageHistory, LineageEntity, SearchLineage} from '../../../domain/monitoring/lineage';
import { EditorComponent } from '../../../workbench/component/detail-workbench/datail-workbench-editor/editor.component';

declare let window : any;
declare let mxCustom_loadEditor:any;
declare let lineage_columnSelect_reset:any;
declare let lineage_draw:any;
declare let instanceEditorUi:any;
declare let mxUtils:any;
declare let $:any;
declare let moment: any;

@Component({
  selector: 'app-lineage-detail',
  templateUrl: './lineage-detail.component.html',
})
export class LineageDetailComponent extends AbstractPopupComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
    private loaded_id: string = '';
    private loaded_page: number = -1;
    private beforeUnloadCallback = null;
    private jobState = 'runnable';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
    @ViewChild(DeleteModalComponent)
    public deleteModalComponent: DeleteModalComponent;
    // 에디터 관련 변수
    @ViewChild(EditorComponent)
    private editor: EditorComponent;

    @Input()
    public step: string;

    //검색한 타겟
    @Input()
    public target : SearchLineage;

    // 리니지 결과 데이터 (하나의 선택값에 리니지 히스토리)
    public lineageHistory: LineageHistory = new LineageHistory();

    // 검색한 타겟으로 조회한 여러 리니지 중 하나의 리니지 엔티티 선택값
    public selectLineage : LineageEntity = new LineageEntity();

    public iconClassType : string = '';

    // 디테일 option layer show/hide
    public isOptionShow: boolean = false;

    public viewMode: string = 'editor';

    public isPropertyShow: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
    // 생성자
    constructor(private popupService: PopupService,
                private lineageService: LineageService,
                protected elementRef: ElementRef,
                protected injector: Injector,
                private zone:NgZone) {

      super(elementRef, injector);
      window.angularComponentRef = {
        zone: this.zone,
        lineageComponent: this
      };
    }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Methods
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
    ngOnInit() {
      super.ngOnInit();
      //this.setRome();
      this.initViewPage();
      this.beforeUnloadCallback = window.onbeforeunload;
      window.onbeforeunload = this.beforeUnload;
    }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Methods
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
    public initViewPage() {
      this.viewMode = 'editor';
      this.getLineageDetailList(true);

    }

    public getLineageDetailList(initPage?) {
      const params = {};
      this.loadingShow();

      if(this.target.type == 'TABLE' || this.target.type == 'COLUMN'){
        Object.assign(params, {
          direction: 'BOTH',
          databaseName : this.target.databaseName,
          tableName : this.target.tableName
        });
        this.lineageService.searchLineageDetailTable(params)
          .then((data) => {
            if(data && data.entities.length>0){
              this.lineageHistory = data;
              if(initPage){
                mxCustom_loadEditor(this.$element.find('#graphEditor')[0], this.lineageHistory);
              }else{
                lineage_draw(initPage, this.lineageHistory);
              }
            }else{
              Alert.error(this.translateService.instant('msg.lineage.ui.list.search.nodata'));
              //this.startDateRome.options({ timeFormat: 'h:mm A', initialValue: this.lineageHistory.from, time: false });
              //this.endDateRome.options({ timeFormat: 'h:mm A', initialValue: this.lineageHistory.to, time: false });
              //this.setChangeEvent();
            }
            //this.setChangeEvent();
            this.loadingHide();
          }).catch((error) => {
            this.loadingHide();
            Alert.error(error.message.toString());
        });
      }else if(this.target.type == 'SQL'){
        Object.assign(params, {
          direction: 'BOTH',
          dataLineageId : this.target.dataLineageId
        });
        this.lineageService.searchLineageDetailSql(params)
          .then((data) => {
            if(data && data.entities.length>0){
              this.lineageHistory = data;
              if(initPage){
                mxCustom_loadEditor(this.$element.find('#graphEditor')[0], this.lineageHistory);
              }else{
                lineage_draw(initPage, this.lineageHistory);
              }
            }else{
              Alert.error(this.translateService.instant('msg.lineage.ui.list.search.nodata'));
            }
            this.loadingHide();
          }).catch((error) => {
            this.loadingHide();
            Alert.error(error.message.toString());
        });
      }
    }

  public getLineageWorkflowProperty() {
  }

  public getLineageTableProperty() {
      const params = {};
      this.loadingShow();

      Object.assign(params, {
        databaseName : this.selectLineage.databaseName,
        tableName : this.selectLineage.tableName
      });
      this.lineageService.searchLineageTableProperty(params)
        .then((data) => {
          if(data){
            this.selectLineage.allColumns = data.columns;
            this.selectLineage.detailed = data.detailed;
            this.selectLineage.storage = data.storage;
            this.isPropertyShow = true;
          }
          this.loadingHide();
        }).catch((error) => {
          this.loadingHide();
          Alert.error(error.message.toString());
      });
    }

    public beforeUnload() {
        console.log('bu');
    }

    // 닫기
    public close() {
      super.close();

      this.popupService.notiPopup({
        name: 'close-detail',
        data: null
      });
    }

    // 줌 인
    public zoomIn() {
      instanceEditorUi.actions.get('zoomIn').funct();
    }

    // 줌 아웃
    public zoomOut() {
      instanceEditorUi.actions.get('zoomOut').funct();
    }

    public reset() {
      lineage_columnSelect_reset();
    }

    public toggleViewMode(changeMode){
      this.viewMode = changeMode;
    }

    // 에러페이지 표현
    public showError(err: string) {
      Alert.error(err);
    }

    ngOnDestroy() {
      window.onbeforeunload = this.beforeUnloadCallback;
      window.angularComponentRef = null;

      super.ngOnDestroy();
    }

    public detailSearchLineage(){
      this.target.name = this.selectLineage.name;
      this.target.type = this.selectLineage.type;
      if(this.target.type == 'SQL'){
        this.target.dataLineageId = this.selectLineage.dataLineageId;
      }else{
        this.target.tableName = this.selectLineage.tableName;
        this.target.databaseName = this.selectLineage.databaseName;
      }
      this.getLineageDetailList(false);
    }

  }
