// @ts-check
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('file:///E:/Downloads/VALKO/DemoExtension/Slides/dialog.html');
  await page.getByRole('button').filter({ hasText: 'person_add' }).click();
  await page.getByPlaceholder('Nombre').click();
  await page.getByPlaceholder('Primer apellido').click();
  await page.getByPlaceholder('Segundo apellido').click();
  await page.getByPlaceholder('Documento identidad').click();
  await page.getByPlaceholder('E-mail').click();


  // Esperar a que el elemento esté visible y luego hacer click
  await page.getByLabel('custom-aria-label').click();


  await page.getByRole('textbox', { name: 'País' }).click();
  await page.getByRole('textbox', { name: 'Departamento' }).click();
  await page.getByRole('textbox', { name: 'Ciudad' }).click();
  await page.getByRole('textbox', { name: 'Perfil facturación' }).click();
  await page.getByRole('tabpanel', { name: 'Info. básica' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByPlaceholder('Compañía').first().click();
  await page.getByPlaceholder('Cargo').first().click();
  await page.locator('#mat-input-2').click();//actividades
  await page.locator('#mat-input-0').click();//periodo_inicio
  await page.locator('#mat-input-1').click();//periodo_fin
  await page.getByPlaceholder('Compañía').nth(1).click();
  await page.getByPlaceholder('Cargo').nth(1).click();
  await page.locator('#mat-input-5').click();//actividades
  await page.locator('#mat-input-3').click();//periodo_inicio
  await page.locator('#mat-input-4').click();//periodo_fin
  await page.getByPlaceholder('Compañía').nth(2).click();
  await page.getByPlaceholder('Cargo').nth(2).click();
  await page.locator('#mat-input-8').click();//actividades
  await page.locator('#mat-input-6').click();//periodo_inicio
  await page.locator('#mat-input-7').click();//periodo_fin
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByPlaceholder('Lenguajes de programación  (Escriba 4)').click();
  await page.getByPlaceholder('Bases de datos (Escriba 4)').click();
  await page.getByPlaceholder('Aplicaciones (Escriba 4)').click();
  await page.getByPlaceholder('Frameworks  (Escriba 4)').click();
  await page.getByPlaceholder('Plataformas (Escriba 4)').click();
  await page.getByPlaceholder('Herramientas (Escriba 4)').click();
  await page.getByPlaceholder('Otros  (Escriba 4)').click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('textbox', { name: 'Nivel Academico' }).click();
  await page.getByRole('listitem').filter({ hasText: 'PREGRADO' }).click(); //profesion
  await page.getByPlaceholder('Institución').first().click();
  await page.getByPlaceholder('Título').click();
  await page.locator('#mat-input-9').click();//fecha_obtencion
  await page.getByPlaceholder('Institución').nth(1).click();
  await page.getByPlaceholder('Curso / Certificación').first().click();
  await page.locator('#mat-input-10').click();//fecha_obtencion
  await page.getByPlaceholder('Institución').nth(2).click();
  await page.getByPlaceholder('Curso / Certificación').nth(1).click();
  await page.locator('#mat-input-11').click();//fecha_obtencion
  await page.getByPlaceholder('Institución').nth(3).click();
  await page.getByPlaceholder('Curso / Certificación').nth(2).click();
  await page.locator('#mat-input-12').click();//fecha_obtencion
  await page.getByRole('button', { name: 'Atrás' }).click();
  await page.getByRole('button', { name: 'Atrás' }).click();
  await page.getByRole('button', { name: 'Atrás' }).click();
});