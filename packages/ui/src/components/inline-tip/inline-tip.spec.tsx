import { render, screen } from "@testing-library/react"
import * as React from "react"
import { InlineTip } from "./inline-tip"

describe("InlineTip", () => {
  it("renders a InlineTip", () => {
    render(<InlineTip label="Test">This is a test</InlineTip>)
    expect(screen.getByText("This is a test")).toBeInTheDocument()
  })

  it("renders a InlineTip with a warning variant", () => {
    render(
      <InlineTip variant="warning" label="Test">
        This is a test
      </InlineTip>
    )
    expect(screen.getByText("This is a test")).toBeInTheDocument()
  })

  it("renders a InlineTip with an error variant", () => {
    render(
      <InlineTip variant="error" label="Test">
        This is a test
      </InlineTip>
    )
    expect(screen.getByText("This is a test")).toBeInTheDocument()
  })

  it("renders a InlineTip with a success variant", () => {
    render(
      <InlineTip variant="success" label="Test">
        This is a test
      </InlineTip>
    )
    expect(screen.getByText("This is a test")).toBeInTheDocument()
  })
})
