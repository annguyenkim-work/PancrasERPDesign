# Feature Specification: Mua hàng và container nhập

**Feature Branch**: `004-mua-hang-container`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Mua hàng và Container nhập: xem đơn mua nhiều mặt hàng, lập đơn mới, xem chi phí trên từng dòng, nhập kho vào một địa điểm và xuất bảng đơn."

## Clarifications

### Session 2026-11-06

- Q: Thuế nhập khẩu và VAT trên đơn nhập nhập một khoản chung hay theo dòng? → A: Mỗi dòng một suất thuế nhập khẩu. Cả đơn một suất VAT. Form không gộp hai thuế thành một khoản chung của container rồi chia xuống dòng.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem đơn mua container (Priority: P1)

Nhân viên thấy danh sách đơn mua. Mỗi đơn hiện mã, số mặt hàng, nhà cung cấp, số container, vận đơn, cảng, ngày dự kiến và kho nhận. Chọn một đơn thì thấy từng mặt hàng và các khoản chi phí đang hiện trên đơn đó.

**Why this priority**: Theo dõi lô đang về là việc mở màn này.

**Independent Test**: Mở màn, chọn một đơn có nhiều mặt hàng, đọc được nhà cung cấp, kho nhận và danh sách mặt hàng.

**Acceptance Scenarios**:

1. **Given** có ít nhất một đơn mua, **When** nhân viên mở màn, **Then** thấy mã đơn, số mặt hàng, nhà cung cấp, số container và kho nhận.
2. **Given** một đơn có nhiều mặt hàng, **When** nhân viên chọn đơn đó, **Then** thấy từng dòng hàng và các khoản chi phí đang gắn với đơn.

---

### User Story 2 - Lập đơn mua nhiều mặt hàng (Priority: P2)

Nhân viên tạo đơn: chọn nhà cung cấp, kho nhận, thông tin container và ít nhất một mặt hàng với số lượng. Đơn mới xuất hiện trong danh sách.

**Why this priority**: Không có đơn mới thì màn chỉ xem dữ liệu cũ.

**Independent Test**: Tạo một đơn hai mặt hàng và thấy đơn đó trong danh sách với đúng số mặt hàng.

**Acceptance Scenarios**:

1. **Given** nhân viên mở phiếu tạo đơn, **When** nhập nhà cung cấp, kho nhận và hai dòng hàng có số lượng lớn hơn 0, **Then** đơn xuất hiện trong danh sách với hai mặt hàng.
2. **Given** phiếu chưa có dòng hàng, **When** nhân viên lưu, **Then** đơn không được tạo.
3. **Given** phiếu tạo đơn có hai dòng, **When** nhân viên nhập hai suất thuế nhập khẩu khác nhau và một suất VAT cho cả đơn, **Then** mỗi dòng hiện suất nhập khẩu của dòng đó, cả hai dòng dùng cùng suất VAT, và phiếu không có một ô gộp thuế nhập khẩu với VAT cho cả container.

---

### User Story 3 - Nhập kho đơn đã về (Priority: P3)

Với đơn chưa nhập kho, nhân viên bấm nhập kho. Sau đó đơn hiện đã nhập kho và không còn nút nhập kho. Nhân viên xuất được bảng các dòng của đơn đang chọn.

**Why this priority**: Nhập kho là bước kết của một lô, sau khi đơn đã được lập và xem.

**Independent Test**: Chọn một đơn chưa nhập, bấm nhập kho, thấy trạng thái đã nhập kho.

**Acceptance Scenarios**:

1. **Given** một đơn chưa ở trạng thái đã nhập kho, **When** nhân viên nhập kho, **Then** đơn hiện đã nhập kho và nút nhập kho không còn.
2. **Given** một đơn đang được chọn, **When** nhân viên xuất bảng, **Then** tệp có các dòng mặt hàng của đơn đó.

---

### Edge Cases

- Danh sách không có đơn: màn hình báo chưa có đơn mua.
- Đơn đã nhập kho: không nhập kho lần nữa từ nút đó.
- Số lượng dòng bằng 0: dòng đó không được lưu vào đơn.
- Kho nhận không phải một địa điểm đang có: đơn không được lưu.
- Hai dòng có hai suất thuế nhập khẩu khác nhau: phiếu lưu được. Suất VAT trên đơn chỉ có một ô.
- Cước tàu, phí cảng, kiểm định và vận chuyển nội địa vẫn là khoản chung của container.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nhân viên MUST thấy danh sách đơn mua với mã, số mặt hàng, nhà cung cấp, thông tin container và kho nhận.
- **FR-002**: Khi chọn một đơn, nhân viên MUST thấy từng mặt hàng và các khoản chi phí đang hiện trên đơn.
- **FR-003**: Nhân viên MUST tạo đơn với nhà cung cấp, một kho nhận và ít nhất một mặt hàng có số lượng lớn hơn 0.
- **FR-004**: Đơn chưa nhập kho MUST có thao tác nhập kho. Sau khi nhập, đơn MUST hiện đã nhập kho và MUST NOT nhập lại bằng cùng thao tác đó.
- **FR-005**: Nhân viên MUST xuất được bảng dòng hàng của đơn đang chọn.
- **FR-006**: Mỗi dòng hàng MUST có suất thuế nhập khẩu riêng. Đơn MUST có một suất VAT áp cho mọi dòng. Phiếu MUST NOT gộp thuế nhập khẩu và VAT thành một khoản chung của container để chia xuống dòng.
- **FR-007**: Giá vốn sau nhập kho MUST [NEEDS CLARIFICATION: dùng chung toàn công ty hay từng kho một giá? Tỷ giá chốt lúc lập đơn, lúc tờ khai, hay lúc thanh toán? Phần Chưa chốt chưa có câu trả lời.]
- **FR-008**: Tiền thuế nhập khẩu của một dòng MUST [NEEDS CLARIFICATION: tính trên giá FOB của dòng nhân tỷ giá, hay trên trị giá tính thuế của tờ khai? Phần Chưa chốt chưa có câu trả lời.]
- **FR-009**: Tiền VAT của một dòng MUST [NEEDS CLARIFICATION: tính trên giá hàng cộng thuế nhập khẩu của dòng, hay còn cộng phần cước và phí được phân bổ cho dòng? Phần Chưa chốt chưa có câu trả lời.]
- **FR-010**: Cước tàu, phí cảng, kiểm định và vận chuyển nội địa MUST [NEEDS CLARIFICATION: phân bổ theo trị giá hay theo khối lượng? Khối lượng lấy theo đơn vị nào? Phần Chưa chốt chưa có câu trả lời.]

### Key Entities *(include if feature involves data)*

- **Đơn mua**: Nhà cung cấp, kho nhận, thông tin container, nhiều dòng hàng, trạng thái chưa nhập hoặc đã nhập kho.
- **Dòng hàng mua**: Mặt hàng, số lượng, suất thuế nhập khẩu của dòng, và các khoản chi phí đang hiện trên dòng.
- **Suất VAT của đơn**: Một suất cho cả đơn mua, dùng chung cho mọi dòng.
- **Nhà cung cấp**: Người bán được chọn khi lập đơn. Hồ sơ nhà cung cấp nằm ở spec danh bạ nhà cung cấp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trong 10 đơn có từ 2 mặt hàng, 10/10 lần chọn đơn đều thấy đủ số dòng đã lưu.
- **SC-002**: 10/10 đơn mới hợp lệ xuất hiện trong danh sách ngay sau khi lưu, với đúng kho nhận đã chọn.
- **SC-003**: 10/10 đơn vừa nhập kho đều hiện đã nhập kho và không còn thao tác nhập kho lần hai.
- **SC-004**: 10/10 phiếu có hai dòng với hai suất thuế nhập khẩu khác nhau đều hiện đúng suất từng dòng và một suất VAT chung. Không phiếu nào có một ô thuế nhập khẩu cộng VAT chung của container.

## Assumptions

- Người dùng là nhân viên đã mở được màn mua hàng. Bảng quyền chỉ là đề xuất.
- Số liệu mẫu trên demo không phải giá vốn, thuế hay tỷ giá thật.
- Các số chi phí trên demo chỉ để hình dung màn hình. Suất thuế nhập khẩu theo dòng và một suất VAT cho cả đơn đã chốt ở FR-006. Căn tính tiền thuế, cách phân bổ cước và phí, và giá vốn sau nhập được đánh dấu [NEEDS CLARIFICATION] ở FR-007 đến FR-010, chưa phải quy tắc.
- Tồn sau khi nhập không được âm. Hàng đang trên đường tính vào tồn nào nằm ở spec kho, tại FR-010.
