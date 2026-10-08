package hrms.bhel.client.dto;

import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for leave approval or rejection requests.
 * Contains optional hr comments for the decision.
 */
public class LeaveApprovalRequest {

  @Size(max = 500, message = "Comments must not exceed 500 characters")
  private String comments;

  public LeaveApprovalRequest() {}

  public LeaveApprovalRequest(String comments) {
    this.comments = comments;
  }

  public String getComments() {
    return comments;
  }

  public void setComments(String comments) {
    this.comments = comments;
  }
}
