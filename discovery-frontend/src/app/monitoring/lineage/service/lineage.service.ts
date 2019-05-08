import {Injectable, Injector} from '@angular/core';
import {AbstractService} from '../../../common/service/abstract.service';
import {CommonUtil} from '../../../common/util/common.util';

@Injectable()
export class LineageService extends AbstractService {

  constructor(protected injector: Injector) {
    super(injector);
  }

  // 검색한 리스트를 불러온다
  public searchLineages(params:any): Promise<any> {
    let url = this.API_URL + 'datalineages';
    url += '?' + CommonUtil.objectToUrlString(params);
    return this.get(url);
  }

  // Lineage 한개 detail
  public searchLineageDetailTable(params:any) : Promise<any> {
    let url = this.API_URL + 'datalineages/lineages';
    url += '?' + CommonUtil.objectToUrlString(params);
    return this.get(url);
  }

  // Lineage 한개 detail
  public searchLineageDetailAll(params:any) : Promise<any> {
    let url = this.API_URL + 'datalineages/lineages/link';
    url += '?' + CommonUtil.objectToUrlString(params);
    return this.get(url);
  }

  // Lineage 한개 detail
  public searchLineageDetailSql(params:any) : Promise<any> {
    let url = this.API_URL + 'datalineages/sql/' + params.dataLineageId + '?';
    url += '&' + CommonUtil.objectToUrlString(params);
    return this.get(url);
  }

  public searchLineageTableProperty(params:any)  : Promise<any> {
    let url = this.API_URL + 'datalineages/tables/information';
    url += '?' + CommonUtil.objectToUrlString(params);
    return this.get(url);
  }
}
