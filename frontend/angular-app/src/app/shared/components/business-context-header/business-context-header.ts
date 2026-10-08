import {Component, inject} from '@angular/core';
import {BusinessContextService} from '../../../core/services/business-context.service';

@Component({
  selector: 'app-business-context-header',
  imports: [],
  templateUrl: './business-context-header.html',
  styleUrl: './business-context-header.scss',
})
export class BusinessContextHeader {
  private readonly businessContext = inject(BusinessContextService);

  readonly selectedBusiness = this.businessContext.selectedBusiness;
}
