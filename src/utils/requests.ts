import {
  PaginatedRequestParams,
  PaginatedResponse,
  RequestByEmployeeParams,
  SetTransactionApprovalParams,
  Transaction,
  Employee,
  Data,
} from "./types"
import mockData from "../mock-data.json"

const TRANSACTIONS_PER_PAGE = 5

const data: Data = {
  employees: mockData.employees,
  transactions: mockData.transactions,
}

const getPersistedData = () => {
  if (!localStorage.getItem("RAMP_DATA")) localStorage.setItem("RAMP_DATA", JSON.stringify(data))
  const RAMP_DATA = localStorage.getItem("RAMP_DATA")
  const persistedData =
    (RAMP_DATA
      ? (JSON.parse(RAMP_DATA) as Data)
      : localStorage.setItem("RAMP_DATA", JSON.stringify(data))) ?? data
  return persistedData
}

export const getEmployees = (): Employee[] => getPersistedData().employees

export const getTransactionsPaginated = ({
  page,
}: PaginatedRequestParams): PaginatedResponse<Transaction[]> => {
  if (page === null) {
    throw new Error("Page cannot be null")
  }

  const start = page * TRANSACTIONS_PER_PAGE
  const end = start + TRANSACTIONS_PER_PAGE

  if (start > getPersistedData().transactions.length) {
    throw new Error(`Invalid page ${page}`)
  }

  const nextPage = end < getPersistedData().transactions.length ? page + 1 : null

  return {
    nextPage,
    data: getPersistedData().transactions.slice(0, end),
    total: getPersistedData().transactions.length,
  }
}

export const getTransactionsByEmployee = ({ employeeId }: RequestByEmployeeParams) => {
  if (!employeeId) {
    throw new Error("Employee id cannot be empty")
  }

  return getPersistedData().transactions.filter((transaction) => transaction.employee.id === employeeId)
}

export const setTransactionApproval = ({ transactionId, value }: SetTransactionApprovalParams): void => {
  const currentTransactions = [...getPersistedData().transactions]
  const transaction = currentTransactions.find(
    (currentTransaction) => currentTransaction.id === transactionId
  )

  if (!transaction) {
    throw new Error("Invalid transaction to approve")
  }
  const newTransactions = currentTransactions.map((currentTransaction) =>
    currentTransaction.id === transactionId
      ? {
        ...currentTransaction,
        approved: value,
      }
      : currentTransaction
  )

  transaction.approved = value
  localStorage.setItem(
    "RAMP_DATA",
    JSON.stringify({
      ...getPersistedData(),
      transactions: newTransactions,
    })
  )
}