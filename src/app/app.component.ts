import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColDef, ColGroupDef, ISelectCellEditorParams, ModuleRegistry } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule } from 'ag-grid-community';
import { provideGlobalGridOptions } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Register ag-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Set legacy theme
provideGlobalGridOptions({
  theme: 'legacy',
});

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  pagination = true;
  paginationPageSize = 10;
  paginationPageSizeSelector = [10, 20, 50, 100];
  isDragging = false;
  startCell: any = null;

  D_R = ["ITNO2175.212", "ITNO8010.332", "ITN54751.01", "ITN66622"]; // Example values

  defaultColDef: ColDef = {
    filter: true,
    floatingFilter: true,
    editable: true,
    enableCellChangeFlash: true,
  };

  rowData = [
    {
      "Drawing Reference": "ITNO2175.212",
      "DWG Mark": "0005A",
      "Component Desc": "FRAME - CS S355JR - HDG",
      Quantity: "2",
      "Component ReceivingRef": "SM087172_ITN02175.212_0005A",
      Length: 1.00,
      Width: 0.50,
      Height: 0.30,
      "Net Weight": 10.00,
      "Gross Weight": 12.00,
      Type: "BASE_THERMO",
      Number: 1,
      Box: 1,
      "Child Box": "LOOSE",
      "Delivery Date": new Date("2021-05-01"),
      "Note Remarks": "Checked",
      "Missing Materials": false,
      CountryOfOrigin: "CH",
      Action: "Packed"
    },
    {
      "Drawing Reference": "ITNO8010.332",
      "DWG Mark": "0006B",
      "Component Desc": "BEAM - AL6061 - ANODIZED",
      Quantity: "3",
      "Component ReceivingRef": "SM087172_ITN08010.332_0006B",
      Length: 2.50,
      Width: 0.80,
      Height: 0.25,
      "Net Weight": 15.50,
      "Gross Weight": 17.00,
      Type: "CAGE",
      Number: 2,
      Box: 2,
      "Child Box": "WRAPPED",
      "Delivery Date": new Date("2021-06-10"),
      "Note Remarks": "Urgent",
      "Missing Materials": false,
      CountryOfOrigin: "IT",
      Action: "Pending"
    },
    {
      "Drawing Reference": "ITN54751.01",
      "DWG Mark": "0007C",
      "Component Desc": "BRACKET - STAINLESS",
      Quantity: "1",
      "Component ReceivingRef": "SM087172_ITN54751.01_0007C",
      Length: 0.75,
      Width: 0.25,
      Height: 0.15,
      "Net Weight": 2.00,
      "Gross Weight": 2.50,
      Type: "PALLET",
      Number: 3,
      Box: 1,
      "Child Box": "LOOSE",
      "Delivery Date": new Date("2021-07-05"),
      "Note Remarks": "",
      "Missing Materials": false,
      CountryOfOrigin: "DE",
      Action: ""
    },
    {
      "Drawing Reference": "ITN66622",
      "DWG Mark": "0008D",
      "Component Desc": "HOUSING - CAST IRON",
      Quantity: "4",
      "Component ReceivingRef": "SM087172_ITN66622_0008D",
      Length: 3.00,
      Width: 1.00,
      Height: 0.60,
      "Net Weight": 25.00,
      "Gross Weight": 28.00,
      Type: "CARDBOARD_BOX",
      Number: 4,
      Box: 3,
      "Child Box": "BOXED",
      "Delivery Date": new Date("2021-08-20"),
      "Note Remarks": "Fragile",
      "Missing Materials": true,
      CountryOfOrigin: "CN",
      Action: "Delayed"
    },
    {
      "Drawing Reference": "SM09909620",
      "DWG Mark": "9005E",
      "Component Desc": "SUPPORT LEG - GALVANIZED",
      Quantity: "5",
      "Component ReceivingRef": "SM087172_SM09909620_9005E",
      Length: 1.50,
      Width: 0.60,
      Height: 0.45,
      "Net Weight": 8.00,
      "Gross Weight": 9.20,
      Type: "WRAPPED",
      Number: 5,
      Box: 2,
      "Child Box": "BUNDLED",
      "Delivery Date": new Date("2021-09-12"),
      "Note Remarks": "Approved",
      "Missing Materials": false,
      CountryOfOrigin: "PL",
      Action: "Completed"
    }
  ];

  colDefs: (ColDef | ColGroupDef)[] = [
    {
      field: "Drawing Reference",
      headerName: "Drawing Reference",
      pinned: 'left',
      cellRenderer: this.customCellRenderer.bind(this),
    },
    { field: "DWG Mark", headerName: "DWG Mark", cellRenderer: this.customCellRenderer.bind(this) },
    { field: "Component Desc", headerName: "Component Desc", cellRenderer: this.customCellRenderer.bind(this) },
    { field: "Quantity", headerName: "Quantity", cellRenderer: this.customCellRenderer.bind(this) },
  ];

  ngOnInit(): void {
    document.addEventListener('mouseup', this.onGlobalMouseUp.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('mouseup', this.onGlobalMouseUp.bind(this));
  }

  onCellMouseDown(event: any): void {
    this.isDragging = true;
    this.startCell = event.node.data;
  }

  onCellMouseOver(event: any): void {
    if (this.isDragging && this.startCell) {
      const colId = event.column.getId();
      event.node.setDataValue(colId, this.startCell[colId]);
    }
  }

  onCellMouseUp(event: any): void {
    this.isDragging = false;
    this.startCell = null;
  }

  onGlobalMouseUp(event: any): void {
    this.isDragging = false;
    this.startCell = null;
  }

  addBlankRow(): void {
    const newRow = {
      "Drawing Reference": "",
      "DWG Mark": "",
      "Component Desc": "",
      Quantity: "",
      "Component ReceivingRef": "",
      Length: 0,
      Width: 0,
      Height: 0,
      "Net Weight": 0,
      "Gross Weight": 0,
      Type: "",
      Number: 0,
      Box: 0,
      "Child Box": "",
      "Delivery Date": new Date(),
      "Note Remarks": "",
      "Missing Materials": false,
      CountryOfOrigin: "",
      Action: ""
    };
    this.rowData = [...this.rowData, newRow];
  }

  customCellRenderer(params: any): HTMLElement {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'custom-cell';
    cellDiv.innerText = params.value || '';

    const fillHandleButton = document.createElement('button');
    fillHandleButton.className = 'fill-handle';
    fillHandleButton.title = 'Drag to fill'; // Tooltip for better UX

    // Add event listeners for the fill handle
    fillHandleButton.addEventListener('mousedown', (event) => {
      this.isDragging = true;
      this.startCell = params.node.data;
      event.stopPropagation(); // Prevent triggering other events
    });

    fillHandleButton.addEventListener('mouseover', () => {
      if (this.isDragging && this.startCell) {
        const colId = params.column.getId();
        params.node.setDataValue(colId, this.startCell[colId]);
      }
    });

    fillHandleButton.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.startCell = null;
    });

    cellDiv.appendChild(fillHandleButton);
    return cellDiv;
  }
}
