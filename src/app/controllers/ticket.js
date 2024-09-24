const Ticket = require('../models/Ticket');
class TicketController {
  //[GET] - /tickets/
  async listTicket(req, res) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const parsedPage = parseInt(page);
      const parsedPageSize = parseInt(pageSize);

      const tickets = await Ticket.find()
        .populate('route', 'name')
        .populate('bus', 'name')
        .populate('seat', 'name')
        .populate('user', 'name')
        .skip((parsedPage - 1) * parsedPageSize)
        .limit(parsedPageSize);

      if (!tickets || tickets.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy vé' });
      }

      const formattedTickets = tickets.map((ticket) => ({
        _id: ticket._id,
        route: ticket.route.name,
        bus: ticket.bus.name,
        seat: ticket.seat.name,
        user: ticket.user.name,
        isReverse: ticket.isReverse,
        price: ticket.price,
        departureTime: ticket.departureTime,
        purchaseDay: ticket.purchaseDay
      }));

      const totalTickets = await Ticket.countDocuments();
      const totalPages = Math.ceil(totalTickets / parsedPageSize);
      const currentPage = parsedPage;

      const prevPage = currentPage > 1 ? currentPage - 1 : null;
      const nextPage = currentPage < totalPages ? currentPage + 1 : null;

      return res.status(200).json({
        totalTickets,
        totalPages,
        currentPage,
        prevPage,
        nextPage,
        tickets: formattedTickets,
      });
    } catch (ex) {
      console.error(ex);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

module.exports = new TicketController();
