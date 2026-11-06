# Feature Specification: Khóa tách gộp hóa đơn khi hoàn tất

**Feature Branch**: `017-khoa-tach-gop-hd`

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "sau khi hoàn tất đơn hàng thì không có chức năng tách/gộp hóa đơn nữa"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Đơn hoàn tất thì không còn tách hoặc gộp (Priority: P1)

Nhân viên mở đơn đã hoàn tất và vào chỗ in phiếu xuất, hóa đơn. Nhân viên không còn thấy cách tách hóa đơn, cũng không còn thấy cách gộp các dòng về một chứng từ. Nhân viên vẫn in được phiếu xuất và chứng từ đã có.

**Why this priority**: Sau nghiệm thu, chứng từ thanh toán phải đứng yên. Sửa tách hoặc gộp lúc này làm lệch với hàng đã giao xong.

**Independent Test**: Mở một đơn đã hoàn tất, vào in phiếu xuất và hóa đơn, rồi xác nhận không có nút tách, không có nút gộp, và vẫn in được phiếu xuất.

**Acceptance Scenarios**:

1. **Given** một đơn đã hoàn tất, **When** nhân viên mở in phiếu xuất và hóa đơn, **Then** không có chức năng tách hóa đơn và không có chức năng gộp hóa đơn.
2. **Given** đơn đã hoàn tất ở kịch bản trên, **When** nhân viên in, **Then** phiếu xuất vẫn in được, gồm đủ mặt hàng của chuyến đã xuất.
3. **Given** một đơn đại lý đang giao, chưa hoàn tất, và đã có phiếu xuất, **When** nhân viên mở in phiếu xuất và hóa đơn, **Then** chức năng tách và gộp vẫn còn, theo spec `015-tach-xuat-hoa-don`.

---

### User Story 2 - Chứng từ đã lưu không đổi sau khi hoàn tất (Priority: P2)

Đơn đại lý đã được tách thành hai chứng từ trước khi hoàn tất: một chứng từ của đại lý và một chứng từ của Khách lẻ / Khách vãng lai. Sau khi đơn hoàn tất, hai chứng từ đó giữ nguyên. Nhân viên không gộp chúng lại thành một, cũng không đổi dòng từ chứng từ này sang chứng từ kia.

**Why this priority**: Khóa chức năng chỉ có nghĩa nếu chứng từ đã chốt không bị ghi đè.

**Independent Test**: Lưu một lần tách hai chứng từ trên đơn đang giao, hoàn tất đơn, rồi kiểm tra hai chứng từ vẫn đúng mã khách và đúng dòng như lúc vừa lưu.

**Acceptance Scenarios**:

1. **Given** đơn đại lý đã lưu hai chứng từ thanh toán và sau đó được hoàn tất, **When** nhân viên mở in, **Then** vẫn thấy đúng hai chứng từ đã lưu, và không có cách đổi dòng giữa hai chứng từ.
2. **Given** đơn đã hoàn tất với một chứng từ đủ dòng, **When** nhân viên tìm cách tách chứng từ đó, **Then** lần tách không được lưu và chứng từ vẫn là một.
3. **Given** đơn đã hoàn tất với hai chứng từ, **When** nhân viên tìm cách gộp về một chứng từ, **Then** lần gộp không được lưu và hai chứng từ giữ nguyên.

---

### User Story 3 - Lần xem trước chưa lưu không sống sót qua hoàn tất (Priority: P3)

Nhân viên đang xem trước một cách tách nhưng chưa bấm lưu, rồi đơn được hoàn tất. Cách tách đang xem trước không được ghi. Chỗ in không còn ô để tách hoặc gộp. Nếu trước đó chưa từng lưu chứng từ thanh toán, bản in là một chứng từ đủ dòng của phiếu xuất.

**Why this priority**: Xem trước không phải chứng từ đã chốt. Hoàn tất không được biến bản nháp thành chứng từ mới.

**Independent Test**: Trên đơn đang giao, đổi một dòng sang phía không lấy hóa đơn nhưng không lưu, hoàn tất đơn, rồi xác nhận không có chứng từ khách lẻ mới và không còn nút tách.

**Acceptance Scenarios**:

1. **Given** đơn đại lý đang giao, nhân viên đã chọn một dòng không lấy hóa đơn nhưng chưa lưu, **When** đơn được hoàn tất, **Then** lựa chọn chưa lưu không thành chứng từ, và không còn chức năng tách hoặc gộp.
2. **Given** đơn đại lý đã hoàn tất mà chưa từng lưu tách, **When** nhân viên in hóa đơn, **Then** có một chứng từ đủ mọi dòng của phiếu xuất, không có chứng từ thứ hai.

---

### Edge Cases

- Đơn khách lẻ, nhà phân phối hoặc dự án khi đã hoàn tất cũng không có tách hoặc gộp hóa đơn. Tách vẫn chỉ thuộc đơn đại lý, và chỉ trước khi hoàn tất, theo spec `015-tach-xuat-hoa-don`.
- Gộp nghĩa là đưa các dòng đang chia trên hai chứng từ về một chứng từ, hoặc đổi một dòng từ chứng từ này sang chứng từ kia. Cả hai việc đều khóa khi đơn đã hoàn tất.
- Phiếu xuất vẫn là một phiếu cho cả chuyến. Khóa tách và gộp không tách phiếu xuất và không trừ kho thêm.
- Đơn chưa hoàn tất mà chưa có phiếu xuất vẫn chưa lưu được tách, như spec `015-tach-xuat-hoa-don`.
- Hoàn tất đơn không đổi khách, số lượng hay địa điểm trên đơn gốc.
- Spec này không chọn thuế, căn tính VAT, thời điểm chiếm nợ, hay thời điểm chốt tỷ giá.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Khi đơn đã hoàn tất, chỗ in phiếu xuất và hóa đơn MUST NOT hiện chức năng tách hóa đơn và MUST NOT hiện chức năng gộp hóa đơn.
- **FR-002**: Sau khi đơn hoàn tất, một lần tách mới hoặc một lần gộp MUST NOT được lưu. Chứng từ thanh toán đã lưu trước lúc hoàn tất MUST giữ nguyên số chứng từ, mã khách và các dòng hàng.
- **FR-003**: Sau khi đơn hoàn tất, nhân viên MUST vẫn in được phiếu xuất của chuyến đã xuất, gồm đủ mặt hàng trên phiếu đó.
- **FR-004**: Nếu đã có chứng từ thanh toán lưu trước lúc hoàn tất, nhân viên MUST vẫn in được đúng các chứng từ đó sau khi đơn hoàn tất.
- **FR-005**: Lựa chọn tách chỉ đang xem trước, chưa lưu, MUST NOT được ghi thành chứng từ khi đơn hoàn tất. Nếu chưa từng lưu chứng từ thanh toán, bản in sau hoàn tất MUST là một chứng từ đủ dòng của phiếu xuất và MUST NOT tạo chứng từ thứ hai.
- **FR-006**: Trước khi đơn hoàn tất, với đơn đại lý đã có phiếu xuất, tách và gộp MUST vẫn làm được theo spec `015-tach-xuat-hoa-don`. Người được lưu vẫn là Kế toán, Giám đốc hoặc Admin.
- **FR-007**: Khóa tách và gộp MUST NOT trừ kho, MUST NOT đổi phiếu xuất, và MUST NOT đổi đơn đặt hàng gốc.

### Key Entities *(include if feature involves data)*

- **Đơn đặt hàng**: Đơn bán có trạng thái đã hoàn tất hoặc chưa. Chỉ trạng thái đã hoàn tất khóa tách và gộp.
- **Phiếu xuất kho**: Một phiếu cho cả chuyến. Vẫn in được sau khi đơn hoàn tất và không bị tách theo hóa đơn.
- **Chứng từ thanh toán**: Chứng từ đã lưu trước lúc hoàn tất. Sau hoàn tất chỉ để đọc và in, không tách thêm và không gộp lại.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trong 10 đơn đã hoàn tất, 10/10 lần mở in phiếu xuất và hóa đơn đều không có chức năng tách và không có chức năng gộp, và 10/10 lần vẫn in được phiếu xuất đủ dòng.
- **SC-002**: Trong 10 đơn đã lưu hai chứng từ rồi mới hoàn tất, 10/10 lần sau hoàn tất vẫn giữ đúng hai chứng từ, đúng mã khách và đúng dòng, và 10/10 lần tìm cách gộp hoặc tách lại đều không lưu thay đổi.
- **SC-003**: Trong 10 đơn đại lý đang giao và đã có phiếu xuất, 10/10 lần trước khi hoàn tất vẫn tách hoặc gộp được theo spec `015-tach-xuat-hoa-don`.
- **SC-004**: Trong 10 lần hoàn tất khi bản tách chỉ đang xem trước, 10/10 lần không tạo chứng từ mới từ bản xem trước đó.

## Assumptions

- Hoàn tất đơn là bước nghiệm thu sau khi hàng đã bàn giao đi giao. Trước bước đó, đơn đại lý đã có phiếu xuất vẫn tách và gộp được.
- Gộp dùng cùng chỗ với tách: đổi dòng giữa chứng từ đại lý và chứng từ Khách lẻ / Khách vãng lai, kể cả đưa mọi dòng về một chứng từ. Không có một lệnh gộp riêng ngoài việc đổi dòng đó.
- Chưa lưu tách trước khi hoàn tất thì bản in là một chứng từ đủ dòng, gắn với khách của đơn đại lý. Đây là cách đọc khi không có chứng từ đã chốt, không phải một lần tách mới.
- Nhà phân phối không gộp với đại lý. Đơn không phải đại lý không có tách hóa đơn, kể cả trước khi hoàn tất.
- Quyền lưu tách trước khi hoàn tất giữ như spec `015-tach-xuat-hoa-don`: Kế toán, Giám đốc, Admin. Các ô quyền còn lại vẫn là đề xuất.
- Giá, thuế và thời điểm chiếm nợ không chọn mới ở spec này.
