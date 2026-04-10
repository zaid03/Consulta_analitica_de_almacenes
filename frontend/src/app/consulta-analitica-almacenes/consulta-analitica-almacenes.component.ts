import { Component, HostListener} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from '../../environments/environment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-consulta-analitica-almacenes',
  standalone: true,
  imports: [ CommonModule ,FormsModule, SidebarComponent],
  templateUrl: './consulta-analitica-almacenes.component.html',
  styleUrls: ['./consulta-analitica-almacenes.component.css']
})
export class ConsultaAnaliticaAlmacenesComponent {
   //3 dots menu 
  showMenu = false;
  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.showMenu = false;
  }

  //global variables
  private entcod: number | null = null;
  public eje: number | null = null;
  almacenes: any[] = [];
  private backupFacturas: any[] = [];
  currentMonth: number = new Date().getMonth() + 1;
  page = 0;
  pageSize = 20;

  constructor(private http: HttpClient, private router: Router) {}

  isLoading: boolean = false;
  almacenSuccess: string = '';
  almacenError: string = '';
  ngOnInit(): void{
    this.limpiarMEssages();
    const entidad = sessionStorage.getItem('Entidad');
    const eje = sessionStorage.getItem('EJERCICIO'); 

    if (entidad) {const parsed = JSON.parse(entidad); this.entcod = parsed.ENTCOD;}
    if (eje) {const parsed = JSON.parse(eje); this.eje = parsed.eje;}

    if (!entidad || this.entcod === null || !eje || this.eje === null) {
      sessionStorage.clear();
      alert('Debes iniciar sesión para acceder a esta página.');
      this.router.navigate(['/login']);
      return;
    }

    this.fatchAlmacenes();
  }

  fatchAlmacenes() {
    this.isLoading = true;
    this.limpiarMEssages();
  }
  private updatePagination(): void {const total = this.totalPages;
    if (total === 0) {this.page = 0; return;}
    if (this.page >= total) {this.page = total - 1;}
  }
  get paginatedAlmacenes(): any[] {if (!this.almacenes || this.almacenes.length === 0) return []; const start = this.page * this.pageSize; return this.almacenes.slice(start, start + this.pageSize);}
  get totalPages(): number {return Math.max(1, Math.ceil((this.almacenes?.length ?? 0) / this.pageSize));}
  prevPage(): void {if (this.page > 0) this.page--;}
  nextPage(): void {if (this.page < this.totalPages - 1) this.page++;}
  goToPage(event: any): void {const inputPage = Number(event.target.value); if (inputPage >= 1 && inputPage <= this.totalPages) {this.page = inputPage - 1;}}

  //misc
  limpiarMEssages() {
    this.almacenSuccess = '';
    this.almacenError = '';
  }
}
