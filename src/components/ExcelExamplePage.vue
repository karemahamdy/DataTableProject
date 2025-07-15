<template>
    <div>
        <HotTable :tableHeader="tableHeader" :tableData="tableData" :groupHeader="groupHeader"
            @json="tableData = $event" @cell="cellUpdate($event)" :cellLockups="cellLockups" 
            :detail="detail" :add_new="true" :customCellStyle="customCellStyle" ref="HotTable" :viewFooter="false"
         @afterScroll="afterScrollVertically"
            :onRowSelection="onRowSelection" />
        <!-- 
        **NOTE  1- json event: Emitted when data is saved from the table (Required).
        **NOTE  2- tableHeader: Defines the main header of the table (Required).
        **NOTE  3- tableData: Contains the main data of the table (Required).
        **NOTE  4- emptyRows: Number of empty rows to display (Optional).
        **NOTE  5- detail: Object to add as a new row when the "add new" button is clicked (Optional).
        **NOTE  6- customCellStyle: Method to return custom styles for cells (Required if customStyle is true).
        **NOTE  7- customStyle: Boolean to enable custom cell styling (Optional).
        **NOTE  8- cellLockups: Function to return lookup data for dropdowns in specific cells (Optional).
        **NOTE  9- cell event: Emitted when a cell's value is changed (Optional).
        **NOTE  10-add_new: Boolean to enable/disable the "add new row" feature (Optional).
        **NOTE  11-Specific Column Jump: Use `$refs?.HotTable?.selectCell(rowIndex, colIndex)` to jump to a specific cell (Optional, requires ref="HotTable").
        **NOTE  12-keyDownWatch: Boolean prop to watch key press events. Use with `@keyPress="keyPress = $event"` to detect keys (Optional).
        **NOTE  13-exportImport: Boolean prop to enable export/import buttons (default is false).
        **NOTE  14-attachmentName: String prop to specify the name of the exported Excel file (default is the screen name).
        **NOTE  15-externalExport: Boolean prop to enable external Excel import. Use with `@import="importFile($event)"` to customize imported data (default is false).
        **NOTE  16- viewFooter calculation: (default false).
        **NOTE  17- customFooterCalculation:(calculation make default if viewFooter = true).
        **NOTE  18- groupHeader:(default [] ) each object contain label and colspan length.
        **NOTE  19- to re-render table use $refs?.HotTable?.render()
        **NOTE  20- to view if  asyncInput Loading use $refs?.HotTable?.isLoading (boolean)
        **NOTE  21- to view if  details validation use $refs?.HotTable?.checkDetailsValidation (boolean)
        **NOTE  22- disable specific row  => add in row object disabled = true
        **NOTE  23- add classes to  specific row  => add in row object classes = "class_example"
        -->
      
    </div>
</template>

<script>
import HotTable from './HotTable.vue';

export default {
    data: (v) => ({
       tableData: [],
    totalRows: 200000,
    batchSize: 100,
    loadedRows: 0,
    customers: [],
    suppliers: [],
    accounts: [],
    types: [],
        // NOTE - lOCKUPS [Examples]
        customers: [],
        suppliers: [],
        accounts: [],
        types: [],
        tableData: [],
        // NOTE - detail (object) if you want to add detail row [Example object]
        detail: {
            d_id: null,
            payment_type: null,
            type_name: null,
            price: 0,
            qty: 1,       // NOTE -Default value  for any new row
            active: null,
           // NOTE -Default value  for any new row
        },
    }),
    computed: {
        /** In computed (tableHeader) [Examples]
         * NOTE - tableHeader is the main header of the table
         * NOTE - Allowed Columns types (text, number, float, date, time, boolean, dropdown, checkbox)
         * NOTE - if you not use width it will be auto (Optional)
         * NOTE - if you not use width it will be auto (Optional)
         * NOTE - if you customStyle is true it will use customCellStyle method (Method Required if customStyle is true)
         * NOTE - if column type is dropdown and not add value in idKey id will be default (key name + _id) (Optional)
         * NOTE - if column type is dropdown and not add value in selectedProp id will be default id (Optional)
         * NOTE - if column type is dropdown and not add value in selectedValue id will be default name (Optional)
         */
        tableHeader() {
            return [
       { text: "invoice no", key: "d_id", type: 'text', readonly: true, width: 80 },
        { text: "payment type", key: "payment_type", type: 'dropdown', lockups: this.types, idKey: 'payment_type_id', width: 100 },
        { text: "entity", key: "type_name", type: 'dropdown', idKey: 'type_id', width: 120 },
        { text: "customer", key: "customer_name", type: 'asyncInput', endpoint: 'customer', idKey: 'customer_id', width: 100, minQueryLength: 2, extraParams: { active: 1 }, listKey: 'items' },
        { text: "customer_id", key: "customer_id", type: 'number', readonly: true, width: 100 },
        { text: "price", key: "price", type: 'float', width: 100, customStyle: true },
        { text: "quantity", key: "qty", type: 'number', width: 100 },
        { text: "active", key: "active", type: 'boolean', width: 100 },
      
      ];
        },
        // NOTE - Group Header Example
    
    },
    watch: {
        tableData() { // NOTE - if you want you want to watch any updates in json data
            this.tableData.forEach((row, index) => {
                if (index === 4) { // NOTE  You can add next code in cell update if ypu want
                    row.disabled = true // NOTE - if you want you to disable row
                    row.classes = 'gray8--text font-weight-bold' //NOTE - if you want you to add any class in row
                    row.type_name = 'disable example'
                }
            });
        }
    },
    mounted() {
        // NOTE - lOCKUPS EXAMPLE
        this.customers = [{ id: 1, name: 'customer 1' }, { id: 2, name: 'customer 2' }]
        this.suppliers = [{ id: 1, name: 'supplier 1' }, { id: 2, name: 'supplier 2' }]
        this.accounts = [{ id: 1, name: 'account1' }, { id: 2, name: 'account 2' }]
        this.types = [{ id: 1, name: 'customer' }, { id: 2, name: 'supplier' }, { id: 3, name: 'account' }]
 for (let i = 0; i < 50; i++) { // 50 * 100 = 5000 rows
        this.loadMoreData();
    }
    },
    methods: {
      generateMockData(start, count) {
  const data = []
  for (let i = start + 1; i <= start + count; i++) {
    data.push({
      d_id: i,
      payment_type: null,
      type_name: null,
      price: Math.floor(Math.random() * 5000),
      qty: 1,
      active: null,
      customer_name: `Customer ${i}`,
      customer_id: i,
      date: null,
      time: null
    })
  }
  return data
},

loadMoreData() {
  if (this.loadedRows >= this.totalRows) return
  const newData = this.generateMockData(this.loadedRows, this.batchSize)
  this.tableData.push(...newData)
  this.loadedRows += this.batchSize
},
afterScrollVertically() {
    console.log('afterScrollVertically called');
    const lastVisibleRow = this.$refs?.HotTable?.getLastVisibleRow();
    console.log('lastVisibleRow:', lastVisibleRow, 'loadedRows:', this.loadedRows);
    if (lastVisibleRow >= this.loadedRows - 10) {
        this.loadMoreData();
    }
},
        // NOTE - Use ((cellLockups)) if you want you want to make custom dropdowns for each cell
        cellLockups(object, row, col) {
            // NOTE - object is the current row object
            // NOTE - row is the current row index
            // NOTE - col is the current column index
            // NOTE - return array of objects OR empty array if no objects
            switch (col) {
                case 2:
                    switch (object?.payment_type) {
                        case 'customer': return this.customers
                        case 'supplier': return this.suppliers
                        case 'account': return this.accounts
                        default: return []
                    }
                default:
                    return [];
            }
        },
        // NOTE - Use ((cellUpdate)) if you want to access cell update
        cellUpdate(cell) {
            if (cell.newValue != cell.oldValue && cell.col == "payment_type") {
                this.tableData[cell.row].type_name = null
                this.tableData[cell.row].type_id = null
            }
        },
        // NOTE - Use ((customCellStyle)) if you want to make custom style for each cell
        customCellStyle(instance, td, row, col, prop, value) {
            return {
                style: {
                    backgroundColor: 'rgb(151 43 43)',
                    color: '#fff',
                },
                textContent: value
            }
        },
        // NOTE - Use ((buttonClick)) if get button click event
        buttonClick(event) {
            this.$global.ShowSnack('warning', 'button clicked on row ' + event.row + ' ,col ' + event.col)
        },
        // NOTE - Use ((imgClick)) if get img click event
        imgClick(event) {
            this.$global.ShowSnack('warning', 'img clicked on row ' + event.row + ' ,col ' + event.col)
        },
        //NOTE - Use ((onRowSelection)) if get row selection
        //NOTE - Note you get row and col number by index
        onRowSelection(row, col) {
            this.$global.ShowSnack('info', 'you select row number =>' + row + ', and col number =>' + col)
        }
    },
    components: { HotTable },
};
</script>

<style></style>