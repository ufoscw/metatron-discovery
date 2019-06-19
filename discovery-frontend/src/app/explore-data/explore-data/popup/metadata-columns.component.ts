import {Component, ElementRef, Injector, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {MetadataService} from "../../../meta-data-management/metadata/service/metadata.service";
import {MetadataColumn} from "../../../domain/meta-data-management/metadata-column";
import {AbstractPopupComponent} from "../../../common/component/abstract-popup.component";
import {CodeTableService} from "../../../meta-data-management/code-table/service/code-table.service";

@Component({
  selector: 'explore-metadata-columns',
  templateUrl: './metadata-columns.component.html',
})
export class MetadataColumnsComponent extends AbstractPopupComponent implements OnInit {

  @Input()
  public metadataId: string;

  @ViewChildren('codeTablePreview')
  public codeTablePreview: QueryList<ElementRef>;

  public columns: MetadataColumn[];

  public codeTableDetailList: {id: number, code: string, value: string}[];

  public isShowCodeTable: boolean = false;

  constructor(protected element: ElementRef,
              protected injector: Injector,
              private _metadataService: MetadataService, private _codeTableService: CodeTableService) {
    super(element,injector);
  }


  ngOnInit() {
    if (this.metadataId) {
      this._getColumns(this.metadataId);
    }
  }


  /**
   * Code Table 상세 팝업 오픈
   * @param column
   * @param idx
   */
  public onClickOpenCodeTable(column, idx) {

    if (column['isShowCodeTable']) {
      return;
    }

    // Only open if code table name exits
    if (!column.codeTable || !column.codeTable.name) {
      return;
    }

    // close already opened popup
    this.columns.forEach((item) => {
      item['isShowCodeTable'] = false;
    });

    // fetch codeTable detail
    this._codeTableService.getCodeTableDetail(column.codeTable.id).then((result) => {

      this.codeTableDetailList = result.codes;

      // open Close
      column.isShowCodeTable = true;

      // find popup top (css)
      const current = this.codeTablePreview.toArray()[idx].nativeElement;
      const parent = this.codeTablePreview.toArray()[idx].nativeElement.parentNode;

      current.style.top = (parent.getBoundingClientRect().top > (this.$window.outerHeight() / 2))
        ? (parent.getBoundingClientRect().top - parent.offsetHeight + 'px')
        : (parent.getBoundingClientRect().top + 25 + 'px');
      current.style.left = parent.getBoundingClientRect().left + 'px';

    }).catch(error => {
      this.commonExceptionHandler(error)
    });


  }


  /**
   * On scroll close popups
   */
  public onScroll() {
    this.columns.forEach((item) => {
      item['isShowCodeTable'] = false;
    })
  }


  /**
   * Fetch column list
   * @param id
   * @private
   */
  private _getColumns(id: string) {
    this._metadataService.getColumnSchemaListInMetaData(id).then((result) => {

      // remove item with name == 'current_datetime'
      this.columns = result.filter((item) => {
        item['isShowCodeTable'] = false;
        return item.name !== 'current_datetime'
      });

    })
  }

}
