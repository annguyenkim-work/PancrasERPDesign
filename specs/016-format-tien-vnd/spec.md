# Feature Specification: Định dạng tiền VNĐ

**Feature Branch**: `016-format-tien-vnd`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "cập nhật specs trong file /specs ghi rõ tất cả các field tiền đều phải có format tiền + đơn vị VNĐ"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Đọc số tiền bằng đồng (Priority: P1)

Nhân viên xem một số tiền đang tính bằng đồng trên bất kỳ màn nào. Số đó hiện có dấu chấm ngăn cách hàng nghìn và có đơn vị VNĐ. Ví dụ số 15000000 đọc được thành 15.000.000 VNĐ.

**Why this priority**: Giá, hạn mức, công nợ và tổng chứng từ đều là số lớn. Thiếu dấu chấm hoặc thiếu đơn vị thì dễ đọc nhầm.

**Independent Test**: Mở một màn có giá hoặc tổng tiền, không đặt con trỏ vào ô đó, và đọc được dấu chấm hàng nghìn cùng chữ VNĐ.

**Acceptance Scenarios**:

1. **Given** một mức giá 15000000 đồng đang hiện trên danh mục, **When** nhân viên nhìn ô hoặc dòng đó mà không sửa, **Then** nhân viên đọc được 15.000.000 VNĐ.
2. **Given** một tổng tiền trên đơn bán, báo giá, phiếu xuất hoặc hóa đơn, **When** nhân viên xem chứng từ, **Then** từng số tiền bằng đồng trên chứng từ có dấu chấm hàng nghìn và đơn vị VNĐ.
3. **Given** một số tiền bằng 0, **When** nhân viên xem ô đó lúc không sửa, **Then** ô hiện 0 VNĐ, không để trống.

---

### User Story 2 - Nhập số tiền bằng đồng (Priority: P2)

Nhân viên sửa một ô tiền đồng. Khi con trỏ đang ở trong ô, nhân viên thấy số để gõ, không kèm chữ VNĐ. Khi nhân viên rời ô, số vừa nhập hiện lại với dấu chấm hàng nghìn và đơn vị VNĐ.

**Why this priority**: Vừa phải đọc đúng đơn vị, vừa phải gõ được số mà không phải xóa chữ VNĐ.

**Independent Test**: Gõ 80000000 vào một ô cước hoặc hạn mức, rời ô, và đọc được 80.000.000 VNĐ.

**Acceptance Scenarios**:

1. **Given** một ô tiền đồng, **When** nhân viên đưa con trỏ vào ô, **Then** ô hiện số thuần để sửa và không hiện chữ VNĐ.
2. **Given** nhân viên đã gõ 80000000, **When** nhân viên rời ô, **Then** ô hiện 80.000.000 VNĐ.
3. **Given** nhân viên xóa hết số trong ô tiền đồng, **When** nhân viên rời ô, **Then** ô hiện 0 VNĐ.
4. **Given** nhân viên gõ một số âm vào ô giá, hạn mức hoặc số tiền thu, **When** nhân viên rời ô, **Then** ô không giữ số âm và hiện 0 VNĐ.

---

### User Story 3 - Không gắn VNĐ vào ô không phải tiền đồng (Priority: P3)

Số lượng, phần trăm, số ngày, số tháng, kilôgam và mét vuông giữ dạng số thường, không có đơn vị VNĐ. Giá FOB trên phiếu nhập khẩu giữ đơn vị USD và vẫn có dấu chấm ngăn cách hàng nghìn. Tỷ giá hiện số đồng cho một USD, nên phần đồng có dấu chấm và đơn vị VNĐ, và vẫn ghi là cho một USD.

**Why this priority**: Gắn VNĐ lên số lượng hoặc đổi giá FOB sang VNĐ sẽ làm sai nghĩa ô đó. Cách tính thuế và thời điểm chốt tỷ giá vẫn là câu hỏi đang mở.

**Independent Test**: Trên phiếu nhập, đọc một ô số lượng và một ô phần trăm không có VNĐ, đọc giá FOB còn đơn vị USD, và đọc tỷ giá có VNĐ cho một USD.

**Acceptance Scenarios**:

1. **Given** một ô số lượng, chiết khấu phần trăm, số ngày công nợ, số tháng bảo hành, khối lượng hoặc diện tích, **When** nhân viên xem hoặc rời ô, **Then** ô không hiện chữ VNĐ và không dùng format tiền.
2. **Given** giá FOB trên phiếu nhập khẩu, **When** nhân viên rời ô, **Then** ô có dấu chấm ngăn cách hàng nghìn và đơn vị USD, không đổi thành VNĐ.
3. **Given** một khoản chiết khấu hoặc số còn nợ đang hiện là số âm, **When** nhân viên xem số đó, **Then** dấu trừ vẫn còn và đơn vị vẫn là VNĐ.

---

### Edge Cases

- Số tiền đồng không có phần thập phân. Nếu nhân viên gõ phần lẻ, lúc rời ô số được làm tròn tới đồng gần nhất rồi mới hiện format và VNĐ.
- Giá FOB được giữ tối đa hai số lẻ sau dấu thập phân, vì đó là số USD, không phải số đồng.
- Số tiền rất lớn, từ hàng tỷ trở lên, vẫn chia nhóm ba chữ số bằng dấu chấm và vẫn có đơn vị.
- Một dòng trừ tiền, như chiết khấu, hiện dấu trừ trước số và vẫn có VNĐ.
- Ô tiền để trống lúc rời ô được hiểu là 0 và hiện 0 VNĐ.
- Quy tắc này không chọn thuế suất, căn tính VAT, thời điểm chốt tỷ giá, hay bảng giá nào được dùng. Những câu đó vẫn mở ở spec tương ứng.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mọi số tiền đang tính bằng đồng, khi người dùng không đứng trong ô đó, MUST hiện dấu chấm ngăn cách mỗi ba chữ số và MUST hiện đơn vị VNĐ. Số 15000000 MUST đọc được thành 15.000.000 VNĐ.
- **FR-002**: Quy tắc FR-001 MUST áp dụng cho số tiền đồng trên danh mục giá, khách hàng, công nợ, combo, mua hàng, bán hàng, báo giá, tổng quan, phiếu xuất và hóa đơn, kể cả số mới được thêm sau này nếu số đó là tiền đồng.
- **FR-003**: Khi người dùng đang sửa một ô tiền đồng, ô MUST hiện số thuần, không kèm VNĐ. Khi người dùng rời ô, FR-001 MUST được áp dụng lại.
- **FR-004**: Ô tiền đồng để trống khi rời ô MUST hiện 0 VNĐ. Ô giá, hạn mức hoặc số tiền thu MUST NOT giữ một số âm sau khi rời ô.
- **FR-005**: Số lượng, phần trăm, số ngày, số tháng, kilôgam và mét vuông MUST NOT dùng format tiền và MUST NOT hiện đơn vị VNĐ.
- **FR-006**: Giá FOB trên phiếu nhập khẩu MUST giữ đơn vị USD, MUST có dấu chấm ngăn cách hàng nghìn, và MUST NOT bị đổi nhãn thành VNĐ.
- **FR-007**: Tỷ giá MUST hiện số đồng với dấu chấm ngăn cách và đơn vị VNĐ, và MUST vẫn cho thấy đó là số đồng của một USD.
- **FR-008**: Số tiền đồng đang là khoản trừ MUST giữ dấu trừ và MUST vẫn hiện đơn vị VNĐ.
- **FR-009**: Spec này MUST NOT chọn thuế suất, căn tính thuế, thời điểm chốt tỷ giá, cách phân bổ chi phí, hay bảng giá áp cho từng loại khách. Các câu đó giữ nguyên trạng thái chưa chốt ở spec đang mở.

### Key Entities *(include if feature involves data)*

- **Số tiền đồng**: Một số đang tính bằng đồng Việt Nam. Khi không sửa, số này có dấu chấm hàng nghìn và đơn vị VNĐ.
- **Ô nhập tiền đồng**: Ô người dùng gõ một số tiền đồng. Lúc gõ thì là số thuần. Lúc rời ô thì trở lại dạng số tiền đồng.
- **Giá FOB**: Số tiền ngoại tệ trên phiếu nhập khẩu, đơn vị USD. Không phải số tiền đồng.
- **Tỷ giá**: Số đồng đổi cho một USD. Phần đồng theo format tiền VNĐ. Cách và thời điểm chốt tỷ giá không thuộc spec này.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10/10 số tiền đồng được xem lúc không sửa đều đọc được với dấu chấm hàng nghìn và chữ VNĐ. Số 15000000 đọc thành 15.000.000 VNĐ.
- **SC-002**: 10/10 lần gõ một số vào ô tiền đồng rồi rời ô đều thấy lại đúng số với dấu chấm hàng nghìn và chữ VNĐ. Trong lúc gõ, chữ VNĐ không nằm trong ô.
- **SC-003**: 10/10 ô số lượng, phần trăm, số ngày, số tháng, kilôgam hoặc mét vuông không hiện chữ VNĐ.
- **SC-004**: 10/10 lần xem giá FOB sau khi rời ô đều còn đơn vị USD và có dấu chấm hàng nghìn, không bị đổi thành VNĐ.

## Assumptions

- Dấu ngăn cách hàng nghìn là dấu chấm, theo cách đọc số ở Việt Nam: 15.000.000 VNĐ.
- Đơn vị người dùng đọc trên số tiền đồng là chữ VNĐ.
- Số tiền đồng không có phần thập phân. Phần lẻ được làm tròn tới đồng gần nhất khi rời ô.
- Giá FOB là số USD, đúng như phiếu nhập khẩu đang tách giá ngoại tệ khỏi các khoản tiền đồng. Spec này chỉ chốt cách đọc, không chốt căn tính thuế hay thời điểm tỷ giá.
- Tỷ giá là số đồng cho một USD. Hiện format cho phần đồng không có nghĩa là tỷ giá đã được chốt ở một mốc thời gian.
- Số lượng, phần trăm, thời hạn, khối lượng và diện tích không phải tiền.
- Mọi người xem được màn nào thì đọc được format trên màn đó. Spec này không thêm hay bớt quyền.
