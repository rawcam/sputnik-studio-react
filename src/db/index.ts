import Dexie, { Table } from 'dexie'
import { Project } from '../store/projectsSlice'
import { CompanyExpense } from '../store/companyExpensesSlice'
import { ServiceVisit } from '../store/serviceVisitsSlice'

export class SputnikDB extends Dexie {
  projects!: Table<Project, string>
  companyExpenses!: Table<CompanyExpense, string>
  serviceVisits!: Table<ServiceVisit, string>

  constructor() {
    super('SputnikDB')
    this.version(1).stores({
      projects: 'id, shortId, category, status, startDate, engineer, projectManager',
      companyExpenses: 'id, date, category, paid',
      serviceVisits: 'id, projectId, date, status, responsible',
    })
  }
}

export const db = new SputnikDB()
