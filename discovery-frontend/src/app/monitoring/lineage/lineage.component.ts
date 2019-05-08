import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PopupService} from '../../common/service/popup.service';
import {SubscribeArg} from '../../common/domain/subscribe-arg';
import {LineageService} from './service/lineage.service';
import {SearchLineage,SearchTableLineage,SearchSqlLineage} from '../../domain/monitoring/lineage';
import {Alert} from '../../common/util/alert.util';
import {Modal} from '../../common/domain/modal';
import {StringUtil} from '../../common/util/string.util';
import {AbstractComponent} from '../../common/component/abstract.component';
import {isUndefined} from 'util';

@Component({
  selector: 'app-lineage',
  templateUrl: './lineage.component.html',
})
export class LineageComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // popup status
  public step: string;    // prod 빌드를 위해 protected를 public 으로 변경

  // 검색어
  public searchText: string = '';

  public searchFormat : string = 'TABLE';

  public target : SearchLineage = new SearchLineage();

  // 검색 결과
  public resultTableData: SearchTableLineage[] = [];

  public resultSqlData: SearchSqlLineage[] = [];

  // 총페이지 수
  public totalElementsTable: number = 0;
  public totalElementsSql: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private lineageService: LineageService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Methods
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  ngOnInit() {
      super.ngOnInit();

       this.initViewPage();

       const popupSubscription = this.popupService.view$.subscribe((data: SubscribeArg) => {

         console.info('popupService 구독', data);
         this.step = data.name;

       });

       this.subscriptions.push(popupSubscription);

      // 리스트 조회
      this.searchLineageList(true);

   }

  ngOnDestroy() {
    super.ngOnDestroy();
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Lineage list 가지고 오기
  public searchLineageList(initPage: boolean = false) {
    this.loadingShow();
    const params = {
      page: this.pageResult.number,
      size: this.pageResult.size
    };
    // 검색어
    if (!StringUtil.isEmpty(this.searchText)) {
      Object.assign(params, {
        keyword: this.searchText
      });
    }

    Object.assign(params, {
      scope: this.searchFormat
    });

    if(this.searchFormat=='TABLE' || this.searchFormat=='COLUMN'){
      this.lineageService.searchLineages(params)
        .then((data) => {
          // page
          this.pageResult = data.page;

          // 리스트 존재 시
          this.resultTableData = data['_embedded'] ? this.resultTableData.concat(data['_embedded'].dataLineageDtoes) : [];

          //this.resultTableData.forEach((item, idx: number) => {
          //  item.num = this.pageResult.totalElements - idx;
          //});
          // 페이지가 첫번째면 초기화
          //if (this.pageResult.number === 0) {
          //  this.resultTableData = [];
          //}
          this.loadingHide();
        }).catch((error) => {
          this.loadingHide();
          Alert.error(error.message.toString());
      });
    }else if(this.searchFormat=='SQL' || this.searchFormat=='WORKFLOW'){
      this.lineageService.searchLineages(params)
        .then((data) => {
          // page
          this.pageResult = data.page;

          // 리스트 존재 시
          this.resultSqlData = data['_embedded'] ? this.resultSqlData.concat(data['_embedded'].dataLineageDtoes) : [];

          //this.resultSqlData.forEach((item, idx: number) => {
          //  item.num = this.pageResult.totalElements - idx;
          //});
          // 페이지가 첫번째면 초기화
          //if (this.pageResult.number === 0) {
          //  this.resultSqlData = [];
          //}
          this.loadingHide();
        }).catch((error) => {
          this.loadingHide();
          Alert.error(error.message.toString());
      });
    }
  }

  // 검색 - 재조회
  public searchLineage(initPage: boolean = false) {
    this.initViewPage();
    this.searchLineageList(initPage);
  }

  public beforeUnload() {
      console.log('bu');
  }

  // detail page 로 넘어가기
  public lineageTableDetail(selectTarget) {
    this.target.name = (selectTarget.type == 'COLUMN')? selectTarget.tableName + " "+ selectTarget.fieldName : selectTarget.tableName;
    this.target.type = selectTarget.type;
    this.target.selectTableLineage = selectTarget;
    this.target.databaseName = selectTarget.databaseName;
    this.target.tableName = selectTarget.tableName;
    this.step = 'lineage-detail';
  }

  // detail page 로 넘어가기
  public lineageSqlDetail(selectTarget) {
    this.target.name= selectTarget.sqlQuery;
    this.target.type = "SQL";
    this.target.selectSqlLineage = selectTarget;
    this.target.dataLineageId = selectTarget.dataLineageId;
    this.step = 'lineage-detail';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private initViewPage() {
    //데이터 초기화
    this.resultTableData = [];
    this.resultSqlData = [];
    // 페이지 초기화
    this.pageResult.number = 0;
    this.pageResult.size = 20;
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 더 조회할 리스트가 있는지 여부
   * @returns {boolean}
   */
  public get checkMoreContents(): boolean {
    if (this.pageResult.number < this.pageResult.totalPages - 1) {
      return true;
    }
    return false;
  }


  /**
   * 쿼리 리스트 컨텐츠 조회
   */
  public moreLineageList() {

    // 페이지 초기화
    this.pageResult.number += 1;

    // 리스트 재조회
    this.searchLineageList();
  }

  public toggleTab(searchFormat){
    this.initViewPage();
    this.searchFormat = searchFormat;
    // 리스트 재조회
    this.searchLineageList();

  }
}

