import { expect, test } from 'bun:test';
import { createTable, getCoreRowModel } from '@tanstack/react-table';
import { reconcileColumnOrder } from './reconcileColumnOrder.helper';

const columns = [
 {id:'colaborador',accessorKey:'name'}, {id:'cargo',accessorKey:'puesto'},
 {accessorKey:'departamento'}, {id:'jefe',accessorKey:'socio'},
 {accessorKey:'fechaIngreso'}, {accessorKey:'modalidad'},
 {id:'estado',accessorKey:'status'}, {id:'actions'},
];
function renderedOrder(columns, saved) {
 const columnOrder = reconcileColumnOrder(columns,saved);
 const table = createTable({columns,data:[{name:'Test',puesto:'Developer',departamento:'IT',socio:'Manager',fechaIngreso:'2026-01-01',modalidad:'REMOTO',status:'CONTRATADO'}],getCoreRowModel:getCoreRowModel(),state:{columnOrder,columnPinning:{left:[],right:[]},columnVisibility:{}},onStateChange:()=>{},renderFallbackValue:null});
 const headers = table.getHeaderGroups()[0].headers.map(h=>h.column.id);
 const cells = table.getRowModel().rows[0].getVisibleCells().map(c=>c.column.id);
 expect(headers).toEqual(cells);
 return {headers,table};
}
test('collaborator action menu follows every data column even with fresh storage',()=>{
 expect(renderedOrder(columns,[]).headers).toEqual(['colaborador','cargo','departamento','jefe','fechaIngreso','modalidad','estado','actions']);
});
test('existing saved data order is retained while misplaced actions return to the end',()=>{
 expect(renderedOrder(columns,['departamento','fechaIngreso','modalidad','actions','colaborador','cargo','jefe','estado']).headers).toEqual(['departamento','fechaIngreso','modalidad','colaborador','cargo','jefe','estado','actions']);
});
test('existing unaliased sibling tables preserve saved order, selection and new-column insertion',()=>{
 const siblings = [{id:'select'}, {accessorKey:'nombre'}, {accessorKey:'total'}, {id:'actions'}];
 expect(renderedOrder(siblings,['select','nombre','actions']).headers).toEqual(['select','nombre','total','actions']);
 expect(renderedOrder(siblings,['select','total','nombre','actions']).headers).toEqual(['select','total','nombre','actions']);
});
