# Feature Specification: Tách xuất kho và chứng từ thanh toán

**Feature Branch**: `015-tach-xuat-hoa-don`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "Tách luồng xử lý từ một Đơn đặt hàng gốc (Sales Order): Khi tạo đơn hàng từ đại lý, hệ thống cho phép tạo một đơn gồm 5 mặt hàng. Đến bước Xuất kho (Delivery / Goods Issue): Kho sẽ trừ đi đúng 5 mặt hàng này (vì hàng thực tế đã đi cùng một chuyến xe). Đến bước Lập hóa đơn / Chứng từ thanh toán (Invoicing / Billing): Hệ thống cho phép tách dòng hoặc tách thành 2 chứng từ hóa đơn con từ một phiếu xuất kho gốc: Chứng từ 1 gắn với mã khách hàng (Đại lý) cho 3 mặt hàng có lấy hóa đơn. Chứng từ 2 gắn với mã Khách lẻ / Khách vãng lai cho 2 mặt hàng không lấy hóa đơn."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xuất kho một chuyến cho cả đơn (Priority: P1)

Nhân viên có một đơn đặt hàng của khách đại lý, trên đơn có 5 mặt hàng. Đến bước xuất kho, nhân viên lập một phiếu xuất cho đúng 5 mặt hàng đó. Hàng đã đi cùng một chuyến, nên kho trừ đúng 5 mặt hàng này, mỗi mặt hàng trừ đúng số lượng trên đơn. Phiếu xuất không bị tách theo việc khách có lấy hóa đơn hay không.

**Why this priority**: Hàng ra kho theo chuyến xe. Nếu tách kho theo hóa đơn, một chuyến sẽ thành hai lần trừ.

**Independent Test**: Ghi nhận một đơn 5 mặt hàng còn đủ hàng, xuất kho một lần, rồi kiểm tra phiếu xuất có đủ 5 mặt hàng và mỗi mặt hàng chỉ bị trừ một lần.

**Acceptance Scenarios**:

1. **Given** một đơn đại lý có 5 mặt hàng và kho còn đủ từng mặt hàng, **When** nhân viên xuất kho cho đơn đó, **Then** có một phiếu xuất gồm đúng 5 mặt hàng, đúng số lượng từng mặt hàng trên đơn.
2. **Given** phiếu xuất ở kịch bản trên vừa được ghi, **When** nhân viên xem tồn của từng mặt hàng tại địa điểm xuất, **Then** mỗi mặt hàng giảm đúng số lượng đã xuất, và không có lần trừ thứ hai.
3. **Given** đơn đã được giữ hàng lúc ghi nhận, **When** nhân viên xuất kho, **Then** số có thể bán không giảm thêm. Phần đang giữ của đúng 5 mặt hàng được giải vì hàng đã đi.

---

### User Story 2 - Tách hai chứng từ thanh toán (Priority: P2)

Sau khi đã có một phiếu xuất kho, nhân viên lập chứng từ thanh toán. Nhân viên tách dòng trên phiếu xuất thành hai chứng từ con. Chứng từ thứ nhất gắn với mã khách đại lý và gồm 3 mặt hàng khách đó lấy hóa đơn. Chứng từ thứ hai gắn với mã Khách lẻ / Khách vãng lai và gồm 2 mặt hàng còn lại, là các mặt hàng không đưa vào hóa đơn của đại lý. Hai chứng từ cộng lại đúng 5 mặt hàng của phiếu xuất. Kho không trừ thêm.

**Why this priority**: Việc lấy hóa đơn khác với việc hàng đã đi. Tách chứng từ chỉ đúng sau khi phiếu xuất đã là một.

**Independent Test**: Với một phiếu xuất 5 mặt hàng, lập hai chứng từ 3 và 2, rồi đọc mã khách trên từng chứng từ và xác nhận tồn không đổi thêm.

**Acceptance Scenarios**:

1. **Given** một phiếu xuất 5 mặt hàng của đơn đại lý, **When** nhân viên lập chứng từ thanh toán và gán 3 mặt hàng cho khách đó, 2 mặt hàng cho Khách lẻ / Khách vãng lai, **Then** có hai chứng từ con. Chứng từ thứ nhất hiện mã khách đại lý và đúng 3 mặt hàng. Chứng từ thứ hai hiện mã Khách lẻ / Khách vãng lai và đúng 2 mặt hàng.
2. **Given** hai chứng từ vừa lập, **When** nhân viên cộng các dòng của hai chứng từ, **Then** được đúng 5 mặt hàng của phiếu xuất, không mặt hàng nào đứng trên cả hai chứng từ, và không mặt hàng nào của phiếu xuất bị bỏ sót.
3. **Given** hai chứng từ vừa lập, **When** nhân viên xem tồn, **Then** tồn không giảm thêm so với lúc sau xuất kho.
4. **Given** một phiếu xuất 5 mặt hàng và cả 5 mặt hàng đều lấy hóa đơn, **When** nhân viên lập chứng từ thanh toán, **Then** chỉ có một chứng từ gắn với khách đại lý, gồm đủ 5 mặt hàng, và không có chứng từ trống thứ hai.
5. **Given** hai chứng từ đã lưu, **When** nhân viên mở đơn đặt hàng gốc, **Then** đơn vẫn là một đơn của khách đại lý đã chọn lúc tạo đơn.

---

### User Story 3 - Không lưu lần tách lệch phiếu xuất (Priority: P3)

Nhân viên thử lập hai chứng từ nhưng thiếu một mặt hàng, gán một mặt hàng vào cả hai chứng từ, hoặc lập chứng từ khi chưa có phiếu xuất. Lần lập đó không được lưu. Phiếu xuất và tồn giữ nguyên.

**Why this priority**: Tách lệch thì tiền và hàng không còn là một chuyến.

**Independent Test**: Với một phiếu xuất 5 mặt hàng, thử lưu một cặp chứng từ chỉ phủ 4 mặt hàng và xác nhận không có chứng từ mới.

**Acceptance Scenarios**:

1. **Given** một phiếu xuất 5 mặt hàng, **When** nhân viên lưu hai chứng từ mà cộng lại chỉ còn 4 mặt hàng, **Then** hai chứng từ không được lưu và phiếu xuất vẫn đủ 5 mặt hàng.
2. **Given** một phiếu xuất 5 mặt hàng, **When** nhân viên gán cùng một mặt hàng vào cả hai chứng từ, **Then** lần lập không được lưu.
3. **Given** một đơn chưa có phiếu xuất kho, **When** nhân viên lập hai chứng từ thanh toán cho đơn đó, **Then** chứng từ không được lưu và kho không trừ hàng.

---

### Edge Cases

- Đơn không đủ 5 mặt hàng vẫn xuất kho được nếu phiếu xuất gồm đúng các mặt hàng đang có trên đơn. Con số 5, 3 và 2 trong mô tả là một lần tách mẫu, không phải hạn mức cố định của mọi đơn.
- Một mặt hàng chỉ được đứng trọn trên một chứng từ. Tách số lượng của cùng một mặt hàng sang cả hai chứng từ không được lưu.
- Tất cả mặt hàng đều lấy hóa đơn: chỉ có một chứng từ, gắn với khách đại lý, gồm mọi mặt hàng của phiếu xuất.
- Không mặt hàng nào lấy hóa đơn: chỉ có một chứng từ, gắn với Khách lẻ / Khách vãng lai, gồm mọi mặt hàng của phiếu xuất.
- Chưa chọn mã Khách lẻ / Khách vãng lai mà vẫn gán mặt hàng cho chứng từ thứ hai: lần lập không được lưu.
- Xuất kho khi một mặt hàng không còn đủ số lượng trên đơn: phiếu xuất không được ghi và không mặt hàng nào của lần đó bị trừ.
- Lập chứng từ thanh toán không đổi khách, số lượng hay địa điểm trên đơn đặt hàng gốc.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nhân viên MUST tạo được một đơn đặt hàng cho một khách đại lý với nhiều mặt hàng. Đơn mẫu của luồng này có 5 mặt hàng.
- **FR-002**: Bước xuất kho của đơn đó MUST lập một phiếu xuất gồm đúng mọi mặt hàng và đúng số lượng trên đơn. Phiếu xuất MUST NOT bị tách thành hai phiếu vì một phần mặt hàng không lấy hóa đơn.
- **FR-003**: Khi phiếu xuất được ghi, kho MUST trừ đúng một lần từng mặt hàng trên phiếu, đúng số lượng đã xuất, vì các mặt hàng đó đã đi cùng một chuyến.
- **FR-004**: Số có thể bán MUST NOT giảm thêm ở bước xuất kho. Phần đang giữ của các mặt hàng trên phiếu MUST được giải khi hàng đi. Việc giữ lúc ghi nhận đơn vẫn theo spec `001-reserve-sale-stock`.
- **FR-005**: Sau khi đã có phiếu xuất, nhân viên MUST tách được các mặt hàng trên phiếu thành hai chứng từ thanh toán con. Chứng từ thứ nhất MUST gắn với mã khách đại lý của đơn và chỉ gồm các mặt hàng khách đó lấy hóa đơn. Chứng từ thứ hai MUST gắn với mã Khách lẻ / Khách vãng lai và chỉ gồm các mặt hàng không đưa vào hóa đơn của đại lý.
- **FR-006**: Hai chứng từ con MUST cùng trỏ về một phiếu xuất gốc và một đơn đặt hàng gốc. Hai chứng từ cộng lại MUST đúng các mặt hàng của phiếu xuất. Một mặt hàng MUST NOT đứng trên cả hai chứng từ.
- **FR-007**: Lần tách thiếu mặt hàng, trùng mặt hàng, tách số lượng của một mặt hàng sang cả hai chứng từ, hoặc chưa có phiếu xuất MUST NOT được lưu. Phiếu xuất và tồn MUST giữ nguyên sau lần không lưu.
- **FR-008**: Lập chứng từ thanh toán MUST NOT trừ kho thêm một lần nữa.
- **FR-009**: Khi mọi mặt hàng cùng một phía, nhân viên MUST lập một chứng từ cho phía đó, gồm đủ mặt hàng của phiếu xuất, và MUST NOT bị buộc tạo chứng từ thứ hai trống.
- **FR-010**: Đơn đặt hàng gốc MUST vẫn là một đơn sau khi tách chứng từ thanh toán. Khách trên đơn MUST vẫn là khách đại lý đã chọn lúc tạo đơn.

### Key Entities *(include if feature involves data)*

- **Đơn đặt hàng**: Một đơn của khách đại lý, có các mặt hàng và số lượng. Đơn không bị tách thành hai đơn.
- **Phiếu xuất kho**: Một chứng từ xuất cho một chuyến, gồm mọi mặt hàng của đơn đã đi. Một đơn trong luồng này có một phiếu xuất đủ hàng.
- **Chứng từ thanh toán**: Chứng từ con lập từ một phiếu xuất. Có mã khách và các mặt hàng được gán. Một phiếu xuất có một hoặc hai chứng từ con.
- **Khách trên chứng từ**: Khách đại lý của đơn, hoặc mã Khách lẻ / Khách vãng lai cho các mặt hàng không lấy hóa đơn của đại lý.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trong 10 đơn có 5 mặt hàng còn đủ hàng, 10/10 lần xuất kho tạo một phiếu xuất đủ 5 mặt hàng và mỗi mặt hàng chỉ giảm tồn đúng một lần.
- **SC-002**: Trong 10 phiếu xuất 5 mặt hàng, 10/10 lần tách 3 mặt hàng cho đại lý và 2 mặt hàng cho Khách lẻ / Khách vãng lai đều ra đúng hai chứng từ, đúng mã khách, và cộng lại đủ 5 mặt hàng không trùng.
- **SC-003**: 10/10 lần lập chứng từ thanh toán sau xuất kho không làm tồn giảm thêm.
- **SC-004**: 10/10 lần tách thiếu mặt hàng, trùng mặt hàng, hoặc lập chứng từ khi chưa xuất kho đều không lưu chứng từ mới.

## Assumptions

- Người xuất kho là nhân viên đã làm được bước xuất kho. Người lập chứng từ thanh toán là Kế toán, Giám đốc hoặc Admin, cùng các vai đã được chốt cho việc sửa đơn trước khi xuất chứng từ. Các ô quyền còn lại vẫn là đề xuất.
- Đơn mẫu của luồng này là đơn đại lý. Nhà phân phối là loại khách thứ tư, không gộp với đại lý. Mã Khách lẻ / Khách vãng lai là một khách loại lẻ dùng cho các mặt hàng không đưa vào hóa đơn của đại lý.
- Số 5, 3 và 2 là lần tách mẫu. Quy tắc là một phiếu xuất cho cả đơn, rồi gán từng mặt hàng trọn vẹn vào một chứng từ thanh toán.
- Một chuyến xuất hết đơn. Xuất nhiều chuyến, tách một mặt hàng thành hai số lượng, và tách thành ba chứng từ thanh toán nằm ngoài phạm vi spec này.
- Giá, chiết khấu, thuế và thời điểm dư nợ bị chiếm không chọn mới ở spec này. Số tiền của mỗi chứng từ gắn với khách ghi trên chứng từ đó. Thời điểm chiếm nợ vẫn là câu mở của spec `011-cong-no`.
- Hàng được giữ lúc ghi nhận đơn theo spec `001-reserve-sale-stock`. Bước xuất kho ghi hàng đã đi, không giữ thêm và không trừ số có thể bán một lần thứ hai.
- Spec `008-ban-hang` mô tả đơn và phiếu xuất. Spec này thêm bước tách chứng từ thanh toán sau phiếu xuất.
